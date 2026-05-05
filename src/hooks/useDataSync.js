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
 *   bulkUpdateStudents: (studentsData: Object[]) => Promise<void>,
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
  const pendingFeeReplacementIdsRef = useRef(new Set());
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
        throw new Error(userMessage);
    }
  }, [user]);

  const updateStudent = useCallback(async (studentData) => {
    // 1. Local Update
    const shouldReplaceFee = !!studentData.replaceFeeHistory;
    const { replaceFeeHistory, ...cleanData } = studentData;
    
    const updatedList = localUpdateStudent(cleanData);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    if (shouldReplaceFee) {
        pendingFeeReplacementIdsRef.current.add(studentData.id);
    }

        // 2. Cloud Update
        guardedSetSyncStatus('syncing');
        try {
            const { student, fees } = normalizeStudent(updatedList.find(s => s.id === studentData.id));

            // Use transactional RPC when replacing fees to ensure atomicity
            if (shouldReplaceFee) {
                const { error } = await supabase.rpc('sync_student_fee_batch', {
                    p_students: [student],
                    p_fees: fees,
                    p_replace_fee_student_ids: [student.id]
                });

                if (error) throw error;

                // Clear the intent after successful sync
                pendingFeeReplacementIdsRef.current.delete(student.id);
            } else {
                const { error } = await supabase.from('students').upsert(student);
                if (error) throw error;
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
        throw new Error(userMessage);
    }
  }, [user]);

  const bulkUpdateStudents = useCallback(async (studentsData) => {
    if (!studentsData || studentsData.length === 0) return;

    // 1. Local Update
    const replaceFeeHistoryIds = new Set(studentsData.filter(s => s.replaceFeeHistory).map(s => s.id));
    const cleanDataList = studentsData.map(s => {
        const { replaceFeeHistory, ...clean } = s;
        return clean;
    });

    const updatedList = localBulkUpdateStudents(cleanDataList);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // Record intent
    replaceFeeHistoryIds.forEach(id => pendingFeeReplacementIdsRef.current.add(id));

    // 2. Cloud Update (Transactional via RPC)
    guardedSetSyncStatus('syncing');
    try {
        const allStudentsDB = [];
        const allFeesDB = [];
        const updatedIds = new Set(studentsData.map(item => item.id));

        updatedList.forEach(mergedStudent => {
            if (updatedIds.has(mergedStudent.id)) {
                const { student, fees } = normalizeStudent(mergedStudent);
                allStudentsDB.push(student);
                if (replaceFeeHistoryIds.has(mergedStudent.id) && fees && fees.length > 0) {
                    allFeesDB.push(...fees);
                }
            }
        });

        const batchReplaceIds = Array.from(replaceFeeHistoryIds);

        const { error } = await supabase.rpc('sync_student_fee_batch', {
            p_students: allStudentsDB,
            p_fees: allFeesDB,
            p_replace_fee_student_ids: batchReplaceIds
        });

        if (error) throw error;

        batchReplaceIds.forEach(id => pendingFeeReplacementIdsRef.current.delete(id));

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
        throw new Error(userMessage);
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
    if (!paymentDetails) return Promise.reject(new Error('Invalid payment details'));
    const payments = Array.isArray(paymentDetails) ? paymentDetails : [paymentDetails];
    if (payments.length === 0) return Promise.reject(new Error('No payments provided'));

    const paymentsWithIds = payments.map(p => ({ ...p, id: crypto.randomUUID(), student_id: studentId }));

    // 1. Client-Side Validation (Catch duplicates before DB insert)
    const { fees } = normalizeStudent({ id: studentId, feeHistory: paymentsWithIds });
    const newMonths = fees.map(f => f.month).filter(Boolean);
    const existingStudent = students.find(s => s.id === studentId);
    const existingMonths = existingStudent?.feeHistory?.map(f => f.month).filter(Boolean) || [];
    
    const duplicates = newMonths.filter(month => existingMonths.includes(month));
    if (duplicates.length > 0) {
        const errorMessage = "Fee already recorded for one or more selected months.";
        guardedSetSyncError({ message: errorMessage, details: new Error(errorMessage) });
        return Promise.reject(new Error(errorMessage));
    }

    // 2. Local Update (Optimistic)
    const updatedList = localAddFeePayment(studentId, paymentsWithIds);
    guardedSetStudents(updatedList);
    guardedSetSyncStatus('unsaved');

    if (!user || !supabase) {
        console.warn("Supabase not configured - changes saved locally only");
        syncChannel?.postMessage('sync_required');
        return;
    }

    // 3. Cloud Update
    guardedSetSyncStatus('syncing');
    try {
        const { error } = await supabase.from('fees').insert(fees);

        if (error) {
            if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate') || error.message?.toLowerCase().includes('unique')) {
                throw new Error("Fee already recorded for one or more selected months.");
            }
            throw error;
        }
        
        guardedSetSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud fee error", err);
        guardedSetSyncStatus('error');

        // Rollback optimistic update
        fetchFromCloud();

        let userMessage = err.message || "Failed to save fee payment to server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        guardedSetSyncError({ message: userMessage, details: err });
        scheduleTimeout(() => {
          guardedSetSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);

        // Security: don't expose raw err.message unless it's our custom one
        return Promise.reject(new Error(userMessage));
    }
  }, [user, supabase, students, fetchFromCloud]);

  const importStudents = useCallback(async (newStudents) => {
    // Save snapshot for rollback
    const previousStudents = [...students];
    const previousStatus = syncStatus;

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

        // Call the 'import-students' Edge Function instead of the RPC directly.
        // This moves the execution to a trusted server environment with service_role access.
        const { data: functionData, error: functionError } = await supabase.functions.invoke('import-students', {
            body: {
                students: allStudentsDB,
                fees: allFeesDB
            }
        });
        if (functionError) throw functionError;

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

        // Rollback to snapshot
        saveStudents(previousStudents);
        guardedSetStudents(previousStudents);
        guardedSetSyncStatus(previousStatus);
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

