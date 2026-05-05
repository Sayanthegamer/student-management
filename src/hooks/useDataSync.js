import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getStudents, saveStudents, addStudent as localAddStudent, updateStudent as localUpdateStudent, bulkUpdateStudents as localBulkUpdateStudents, deleteStudent as localDeleteStudent, addFeePayment as localAddFeePayment } from '../utils/storage';
import { denormalizeStudents, normalizeStudent } from '../utils/syncHelpers';
import { useAuth } from '../context/AuthContext';

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('stdmgr_sync_channel') : null;

/**
 * Custom hook for managing student data synchronization with Supabase and local storage.
 * Provides functions for CRUD operations on students and fee payments, handling both local optimistic updates
 * and remote data syncing.
 *
 * @returns {{
 *   students: Object[],
 *   syncStatus: string,
 *   syncError: Object|null,
 *   addStudent: (studentData: Object) => Promise<void>,
 *   updateStudent: (studentData: Object) => Promise<void>,
 *   deleteStudent: (id: string) => Promise<void>,
 *   addFeePayment: (studentId: string, paymentDetails: Object|Object[]) => Promise<void>,
 *   importStudents: (newStudents: Object[]) => Promise<void>,
 *   dismissError: () => void,
 *   forceSync: () => Promise<void>
 * }} Data sync state and operation functions.
 */
export const useDataSync = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(getStudents());
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error', 'unsaved'
  const [syncError, setSyncError] = useState(null);
  const isSyncingRef = useRef(false);
  const pendingSyncRef = useRef(false);
  const latestDoFetchRef = useRef(null);
  const fetchAbortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const pendingTimeoutsRef = useRef([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const guardedSetSyncStatus = useCallback((status) => {
    if (isMountedRef.current) {
        if (typeof status === 'function') {
            setSyncStatus(status);
        } else {
            setSyncStatus(status);
        }
    }
  }, []);

  const guardedSetSyncError = useCallback((error) => {
    if (isMountedRef.current) setSyncError(error);
  }, []);

  const guardedSetStudents = useCallback((students) => {
      if(isMountedRef.current) setStudents(students);
  }, []);

  const scheduleTimeout = useCallback((callback, delay) => {
      const id = setTimeout(() => {
          if (isMountedRef.current) {
              callback();
          }
          pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(t => t !== id);
      }, delay);
      pendingTimeoutsRef.current.push(id);
      return id;
  }, []);

  // Reusable fetch from cloud — used by initial load AND forceSync
  const fetchFromCloud = useCallback(async () => {
    const doFetch = async () => {
        if (fetchAbortControllerRef.current) {
            fetchAbortControllerRef.current.abort();
        }
        fetchAbortControllerRef.current = new AbortController();
        const signal = fetchAbortControllerRef.current.signal;
        // Update ref to always point to the latest doFetch with current closure
        latestDoFetchRef.current = doFetch;

        if (!user || !supabase) {
          guardedSetStudents(getStudents());
          guardedSetSyncError(null);
          guardedSetSyncStatus('synced');
          return;
        }

        isSyncingRef.current = true;
        guardedSetSyncStatus('syncing');
        guardedSetSyncError(null);
        try {
          const { data: studentsData, error: sError } = await supabase.from('students').select('*').abortSignal(signal);
          if (sError) throw sError;

          const { data: feesData, error: fError } = await supabase.from('fees').select('*').abortSignal(signal);
          if (fError) throw fError;

          // "Online Source is Truth" - Always overwrite local with cloud data if connection is successful.
          const merged = denormalizeStudents(studentsData, feesData);
          saveStudents(merged);
          guardedSetStudents(merged);
          guardedSetSyncStatus('synced');
        } catch (err) {
          // Supabase client wraps native AbortErrors into its own error objects,
          // so err.name won't be 'AbortError'. Check message and signal state too.
          const isAbort = err.name === 'AbortError'
            || err.message?.includes('AbortError')
            || err.message?.includes('aborted')
            || fetchAbortControllerRef.current?.signal?.aborted;
          if (isAbort) return;
          console.error("Sync error:", err);
          guardedSetSyncStatus('error');
          guardedSetSyncError({
            message: "Failed to load data from server. Please check your connection.",
            details: err
          });

          scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
        } finally {
          isSyncingRef.current = false;
          if (pendingSyncRef.current) {
              pendingSyncRef.current = false;
              latestDoFetchRef.current && latestDoFetchRef.current();
          }
        }
    };

    if (isSyncingRef.current) {
        pendingSyncRef.current = true;
        return;
    }

    return doFetch();
  }, [user]);

  // Load from Supabase on mount/auth change
  useEffect(() => {
    fetchFromCloud();

    const handleSyncMessage = (event) => {
      if (event.data === 'sync_required') {
        fetchFromCloud();
      }
    };

    if (syncChannel) {
      syncChannel.addEventListener('message', handleSyncMessage);
    }

    return () => {
      if (syncChannel) {
        syncChannel.removeEventListener('message', handleSyncMessage);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
        fetchAbortControllerRef.current = null;
      }
      latestDoFetchRef.current = null;
      isSyncingRef.current = false;
      pendingSyncRef.current = false;
      pendingTimeoutsRef.current.forEach(clearTimeout);
      pendingTimeoutsRef.current = [];
    };
  }, [fetchFromCloud]);

  const addStudent = useCallback(async (studentData) => {
    const id = crypto.randomUUID();
    const newStudent = { ...studentData, id };

    // Auto-create admission fee record if admission fee is set (clamp to non-negative)
    const grossAdmission = Math.max(0, Number(studentData.admissionFee) || 0);
    const concession = Math.max(0, Number(studentData.concessionAmount) || 0);
    const netAdmission = Math.max(0, grossAdmission - concession);
    
    // Calculate total from new itemized structures
    const sanitizeBreakdown = (breakdownObj) => {
        const sanitized = {};
        for (const [key, val] of Object.entries(breakdownObj || {})) {
            let parsed = Number(val);
            if (!isFinite(parsed) || parsed < 0) parsed = 0;
            sanitized[key] = parsed;
        }
        return sanitized;
    };

    const sanitizedAnnual = sanitizeBreakdown(studentData.annualChargesBreakdown);
    const sanitizedSubsidiary = sanitizeBreakdown(studentData.subsidiaryChargesBreakdown);

    const annualTotal = Object.values(sanitizedAnnual).reduce((acc, curr) => acc + curr, 0);
    const subsidiaryTotal = Object.values(sanitizedSubsidiary).reduce((acc, curr) => acc + curr, 0);
    
    const totalInitialFee = netAdmission + annualTotal + subsidiaryTotal;

    if (totalInitialFee > 0) {
      const isNew = studentData.enrollmentType === 'NEW';
      const admissionPayment = {
        id: crypto.randomUUID(),
        date: studentData.admissionDate || new Date().toISOString().split('T')[0],
        month: '', // Admission/Initial fees are not tied to a specific month
        amount: totalInitialFee,
        fine: 0,
        type: 'Admission',
        remarks: (isNew ? 'New Registration Checkout' : 'Annual Re-enrollment Checkout') + (concession > 0 ? ` (Concession: ₹${concession})` : ''),
        itemized_breakdown: {
            admission: netAdmission,
            concession: concession,
            annual: sanitizedAnnual,
            subsidiary: sanitizedSubsidiary
        }
      };
      newStudent.feeHistory = [admissionPayment, ...(newStudent.feeHistory || [])];
    }


    // 1. Local Update (Optimistic)
    const updatedList = localAddStudent(newStudent);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    guardedSetSyncStatus('syncing');
    try {
        const { student, fees } = normalizeStudent(newStudent);

        const { error } = await supabase.from('students').insert(student);
        if (error) throw error;

        if (fees.length > 0) {
             const { error: fError } = await supabase.from('fees').insert(fees);
             if (fError) throw fError;
        }

        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud save error", err);
        guardedSetSyncStatus('error');

        let userMessage = "Failed to save data to server.";
        if (err.message?.includes('duplicate')) {
          userMessage = "A student with this ID already exists.";
        } else if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({
            message: userMessage,
            details: err
        });

        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const updateStudent = useCallback(async (studentData) => {
    // 1. Local Update
    const updatedList = localUpdateStudent(studentData);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    guardedSetSyncStatus('syncing');
    try {
        const { student, fees } = normalizeStudent(studentData);

        const { error } = await supabase.from('students').upsert(student);
        if (error) throw error;

        const feeIdsToKeep = fees.map(f => f.id).filter(Boolean);
        
        // Find existing fees to safely delete orphans
        const { data: existingFees, error: selectError } = await supabase.from('fees').select('id').eq('student_id', student.id);
        if (selectError) throw selectError;
        
        if (existingFees) {
            const feeIdsToDelete = existingFees.map(f => f.id).filter(id => !feeIdsToKeep.includes(id));
            if (feeIdsToDelete.length > 0) {
                const { error: deleteError } = await supabase.from('fees').delete().in('id', feeIdsToDelete);
                if (deleteError) throw deleteError;
            }
        }

        if (fees.length > 0) {
          // Use upsert instead of delete-then-insert to avoid race conditions
          // where concurrent fee payments could be wiped between delete and insert.
          const { error: fError } = await supabase.from('fees').upsert(fees);
          if (fError) throw fError;
        }

        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud update error", err);
        guardedSetSyncStatus('error');

        let userMessage = "Failed to update student on server.";
        if (err.message?.includes('duplicate')) {
          userMessage = "A student with this ID already exists.";
        } else if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({
            message: userMessage,
            details: err
        });

        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const bulkUpdateStudents = useCallback(async (studentsData) => {
    if (!studentsData || studentsData.length === 0) return;

    // 1. Local Update
    const updatedList = localBulkUpdateStudents(studentsData);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    guardedSetSyncStatus('syncing');
    try {
        // First, get merged student objects from localBulkUpdateStudents result
        // (which preserves existing feeHistory for partial patches)
        const allStudentsDB = [];
        const allFeesDB = [];

        // Build allStudentsDB and allFeesDB from the merged student objects
        updatedList.forEach(mergedStudent => {
            // Only process students that were part of the update
            if (studentsData.some(sd => sd.id === mergedStudent.id)) {
                const { student, fees } = normalizeStudent(mergedStudent);
                allStudentsDB.push(student);
                if (fees && fees.length > 0) allFeesDB.push(...fees);
            }
        });

        // Upsert students
        const { error: sError } = await supabase.from('students').upsert(allStudentsDB);
        if (sError) throw sError;

        // Mirror updateStudent's reconciliation for fees using per-student comparisons
        const studentIds = allStudentsDB.map(s => s.id);
        const { data: existingFees, error: selectError } = await supabase.from('fees').select('id, student_id').in('student_id', studentIds);
        if (selectError) throw selectError;

        if (existingFees) {
            // Group incoming fees by student_id
            const incomingFeesByStudent = {};
            allFeesDB.forEach(fee => {
                if (!incomingFeesByStudent[fee.student_id]) {
                    incomingFeesByStudent[fee.student_id] = new Set();
                }
                if (fee.id) incomingFeesByStudent[fee.student_id].add(fee.id);
            });

            // Compute feeIdsToDelete using per-student comparisons
            const feeIdsToDelete = existingFees
                .filter(existingFee => {
                    const incomingFeeIds = incomingFeesByStudent[existingFee.student_id];
                    return !incomingFeeIds || !incomingFeeIds.has(existingFee.id);
                })
                .map(f => f.id);

            if (feeIdsToDelete.length > 0) {
                const { error: deleteError } = await supabase.from('fees').delete().in('id', feeIdsToDelete);
                if (deleteError) throw deleteError;
            }
        }

        if (allFeesDB.length > 0) {
            const { error: fError } = await supabase.from('fees').upsert(allFeesDB);
            if (fError) throw fError;
        }

        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud bulk update error", err);
        guardedSetSyncStatus('error');

        let userMessage = "Failed to bulk update students on server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({ message: userMessage, details: err });
        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const deleteStudent = useCallback(async (id) => {
    // 1. Local Update
    const updatedList = localDeleteStudent(id);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    guardedSetSyncStatus('syncing');
    try {
        // Issue #4: Rely on database ON DELETE CASCADE for fees

        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud delete error", err);
        guardedSetSyncStatus('error');

        let userMessage = "Failed to delete student from server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({
            message: userMessage,
            details: err
        });

        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const addFeePayment = useCallback(async (studentId, paymentDetails) => {
    // paymentDetails can be object or array
    if (!paymentDetails) return Promise.reject(new Error('Invalid payment details'));
    const payments = Array.isArray(paymentDetails) ? paymentDetails : [paymentDetails];
    if (payments.length === 0) return Promise.reject(new Error('No payments provided'));

    // Assign IDs locally
    const paymentsWithIds = payments.map(p => ({ ...p, id: crypto.randomUUID(), student_id: studentId }));

    if (user && supabase) {
        guardedSetSyncStatus('syncing');
        try {
            const { fees } = normalizeStudent({ id: studentId, feeHistory: paymentsWithIds });
            const { error } = await supabase.from('fees').insert(fees);

            if (error) {
                // Catch unique constraint violations (code 23505) or duplicate key
                if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate') || error.message?.toLowerCase().includes('unique')) {
                    return Promise.reject(new Error("Fee already recorded for one or more selected months."));
                }
                throw error;
            }
            guardedSetSyncStatus('synced');
            syncChannel?.postMessage('sync_required');
        } catch (err) {
            console.error("Cloud fee error", err);
            guardedSetSyncStatus('error');

            let userMessage = err.message || "Failed to save fee payment to server.";
            if (err.message?.includes('permission')) {
              userMessage = "You don't have permission to perform this action.";
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
              userMessage = "Network error. Please check your connection.";
            }

            guardedSetSyncError({
                message: userMessage,
                details: err
            });

            scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);

            return Promise.reject(new Error(userMessage));
        }
    }

    // 1. Local Update (Only reaches here if Cloud Update succeeds, or offline)
    // Check for duplicate months before local save (offline/local-only path)
    if (!user || !supabase) {
        // Normalize and extract the fee months being added
        const { fees } = normalizeStudent({ id: studentId, feeHistory: paymentsWithIds });
        const newMonths = fees.map(f => f.month).filter(Boolean); // Filter out empty months (e.g., Admission fees)

        // Get existing months for this student
        const existingStudent = students.find(s => s.id === studentId);
        const existingMonths = existingStudent?.feeHistory
            ?.map(f => f.month)
            .filter(Boolean) || [];

        // Check for duplicates
        const duplicates = newMonths.filter(month => existingMonths.includes(month));

        if (duplicates.length > 0) {
            guardedSetSyncStatus('error');
            const errorMessage = "Fee already recorded for one or more selected months.";
            guardedSetSyncError({
                message: errorMessage,
                details: new Error(errorMessage)
            });
            return Promise.reject(new Error(errorMessage));
        }
    }

    const updatedList = localAddFeePayment(studentId, paymentsWithIds);
    guardedSetStudents(updatedList);

    if (!user || !supabase) {
        guardedSetSyncStatus('unsaved');
        console.warn("Supabase not configured - changes saved locally only");
        syncChannel?.postMessage('sync_required');
    }
  }, [user, supabase, students]);

  const importStudents = useCallback(async (newStudents) => {
    // 1. Local Update (Full Replace)
    saveStudents(newStudents);
    guardedSetStudents(newStudents);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update (Batch)
    guardedSetSyncStatus('syncing');
    try {
        const allStudentsDB = [];
        const allFeesDB = [];

        newStudents.forEach(s => {
          const { student, fees } = normalizeStudent(s);
          allStudentsDB.push(student);
          if (fees && fees.length > 0) {
              allFeesDB.push(...fees);
          }
        });

        // Batch Upsert Students FIRST
        // Using upsert to handle potential ID collisions or updates if IDs are preserved
        const { error: sError } = await supabase.from('students').upsert(allStudentsDB);
        if (sError) throw sError;

        // Batch Upsert Fees FIRST
        if (allFeesDB.length > 0) {
             const { error: fError } = await supabase.from('fees').upsert(allFeesDB);
             if (fError) throw fError;
        }

        // Issue #10: Delete old records AFTER successful upsert to prevent ghost records and avoid total data wipe on partial failure
        const studentIdsToKeep = allStudentsDB.map(s => s.id);
        const feeIdsToKeep = allFeesDB.map(f => f.id);

        let feesQuery = supabase.from('fees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (feeIdsToKeep.length > 0) {
            // Because Supabase 'not.in' expects a comma-separated list formatted string like '(id1,id2)'
            feesQuery = feesQuery.not('id', 'in', `(${feeIdsToKeep.join(',')})`);
        }
        const { error: delFeesError } = await feesQuery;
        if (delFeesError) throw delFeesError;

        let studentsQuery = supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (studentIdsToKeep.length > 0) {
            studentsQuery = studentsQuery.not('id', 'in', `(${studentIdsToKeep.join(',')})`);
        }
        const { error: delStudentsError } = await studentsQuery;
        if (delStudentsError) throw delStudentsError;

        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud import error", err);
        guardedSetSyncStatus('error');

        let userMessage = "Failed to import data to server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({
            message: userMessage,
            details: err
        });

        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const dismissError = useCallback(() => {
    guardedSetSyncError(null);
  }, []);

  return {
    students,
    syncStatus,
    syncError,
    addStudent,
    updateStudent,
    bulkUpdateStudents,
    deleteStudent,
    addFeePayment,
    importStudents,
    dismissError,
    forceSync: fetchFromCloud
  };
};

