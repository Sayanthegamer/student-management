import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getStudents, saveStudents, addStudent as localAddStudent, updateStudent as localUpdateStudent, deleteStudent as localDeleteStudent, addFeePayment as localAddFeePayment } from '../utils/storage';
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

  // Reusable fetch from cloud — used by initial load AND forceSync
  const fetchFromCloud = useCallback(async () => {
    const doFetch = async () => {
        // Update ref to always point to the latest doFetch with current closure
        latestDoFetchRef.current = doFetch;

        if (!user || !supabase) {
          setStudents(getStudents());
          setSyncError(null);
          setSyncStatus('synced');
          return;
        }

        isSyncingRef.current = true;
        setSyncStatus('syncing');
        setSyncError(null);
        try {
          const { data: studentsData, error: sError } = await supabase.from('students').select('*');
          if (sError) throw sError;

          const { data: feesData, error: fError } = await supabase.from('fees').select('*');
          if (fError) throw fError;

          // "Online Source is Truth" - Always overwrite local with cloud data if connection is successful.
          const merged = denormalizeStudents(studentsData, feesData);
          saveStudents(merged);
          setStudents(merged);
          setSyncStatus('synced');
        } catch (err) {
          console.error("Sync error:", err);
          setSyncStatus('error');
          setSyncError({
            message: "Failed to load data from server. Please check your connection.",
            details: err
          });

          setTimeout(() => {
            setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
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
      return () => syncChannel.removeEventListener('message', handleSyncMessage);
    }
  }, [fetchFromCloud]);

  const addStudent = useCallback(async (studentData) => {
    const id = crypto.randomUUID();
    const newStudent = { ...studentData, id };

    // Auto-create admission fee record if admission fee is set (clamp to non-negative)
    const grossAdmission = Math.max(0, Number(studentData.admissionFee) || 0);
    const concession = Math.max(0, Number(studentData.concessionAmount) || 0);
    const netAdmission = Math.max(0, grossAdmission - concession);

    if (netAdmission > 0) {
      const admissionPayment = {
        id: crypto.randomUUID(),
        date: studentData.admissionDate || new Date().toISOString().split('T')[0],
        month: '', // Admission fees are not tied to a specific month
        amount: netAdmission,
        fine: 0,
        type: 'Admission',
        remarks: concession > 0 ? `Admission fee (Concession: ₹${concession})` : 'Admission fee',
      };
      newStudent.feeHistory = [admissionPayment, ...(newStudent.feeHistory || [])];
    }

    // 1. Local Update (Optimistic)
    const updatedList = localAddStudent(newStudent);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { student, fees } = normalizeStudent(newStudent);

        const { error } = await supabase.from('students').insert(student);
        if (error) throw error;

        if (fees.length > 0) {
             const { error: fError } = await supabase.from('fees').insert(fees);
             if (fError) throw fError;
        }

        setSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud save error", err);
        setSyncStatus('error');

        let userMessage = "Failed to save data to server.";
        if (err.message?.includes('duplicate')) {
          userMessage = "A student with this ID already exists.";
        } else if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        setSyncError({
            message: userMessage,
            details: err
        });

        setTimeout(() => {
          setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const updateStudent = useCallback(async (studentData) => {
    // 1. Local Update
    const updatedList = localUpdateStudent(studentData);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { student, fees } = normalizeStudent(studentData);

        const { error } = await supabase.from('students').upsert(student);
        if (error) throw error;

        if (fees.length > 0) {
          // Use upsert instead of delete-then-insert to avoid race conditions
          // where concurrent fee payments could be wiped between delete and insert.
          const { error: fError } = await supabase.from('fees').upsert(fees);
          if (fError) throw fError;
        }

        setSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud update error", err);
        setSyncStatus('error');

        let userMessage = "Failed to update student on server.";
        if (err.message?.includes('duplicate')) {
          userMessage = "A student with this ID already exists.";
        } else if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        setSyncError({
            message: userMessage,
            details: err
        });

        setTimeout(() => {
          setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const deleteStudent = useCallback(async (id) => {
    // 1. Local Update
    const updatedList = localDeleteStudent(id);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        setSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud delete error", err);
        setSyncStatus('error');

        let userMessage = "Failed to delete student from server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        setSyncError({
            message: userMessage,
            details: err
        });

        setTimeout(() => {
          setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const addFeePayment = useCallback(async (studentId, paymentDetails) => {
    // paymentDetails can be object or array
    const payments = Array.isArray(paymentDetails) ? paymentDetails : [paymentDetails];

    // Assign IDs locally
    const paymentsWithIds = payments.map(p => ({ ...p, id: crypto.randomUUID(), student_id: studentId }));

    if (user && supabase) {
        setSyncStatus('syncing');
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
            setSyncStatus('synced');
            syncChannel?.postMessage('sync_required');
        } catch (err) {
            console.error("Cloud fee error", err);
            setSyncStatus('error');

            let userMessage = err.message || "Failed to save fee payment to server.";
            if (err.message?.includes('permission')) {
              userMessage = "You don't have permission to perform this action.";
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
              userMessage = "Network error. Please check your connection.";
            }

            setSyncError({
                message: userMessage,
                details: err
            });

            setTimeout(() => {
              setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
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
            setSyncStatus('error');
            const errorMessage = "Fee already recorded for one or more selected months.";
            setSyncError({
                message: errorMessage,
                details: new Error(errorMessage)
            });
            return Promise.reject(new Error(errorMessage));
        }
    }

    const updatedList = localAddFeePayment(studentId, paymentsWithIds);
    setStudents(updatedList);

    if (!user || !supabase) {
        setSyncStatus('unsaved');
        console.warn("Supabase not configured - changes saved locally only");
        syncChannel?.postMessage('sync_required');
    }
  }, [user, supabase, students]);

  const importStudents = useCallback(async (newStudents) => {
    // 1. Local Update (Full Replace)
    saveStudents(newStudents);
    setStudents(newStudents);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      syncChannel?.postMessage('sync_required');
      return;
    }

    // 2. Cloud Update (Batch)
    setSyncStatus('syncing');
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

        // Batch Insert Students
        // Using upsert to handle potential ID collisions or updates if IDs are preserved
        const { error: sError } = await supabase.from('students').upsert(allStudentsDB);
        if (sError) throw sError;

        // Batch Insert Fees
        if (allFeesDB.length > 0) {
             const { error: fError } = await supabase.from('fees').upsert(allFeesDB);
             if (fError) throw fError;
        }

        setSyncStatus('synced');
        syncChannel?.postMessage('sync_required');
    } catch (err) {
        console.error("Cloud import error", err);
        setSyncStatus('error');

        let userMessage = "Failed to import data to server.";
        if (err.message?.includes('permission')) {
          userMessage = "You don't have permission to perform this action.";
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = "Network error. Please check your connection.";
        }

        setSyncError({
            message: userMessage,
            details: err
        });

        setTimeout(() => {
          setSyncStatus(prev => prev === 'error' ? 'unsaved' : prev);
        }, 5000);
    }
  }, [user]);

  const dismissError = useCallback(() => {
    setSyncError(null);
  }, []);

  return {
    students,
    syncStatus,
    syncError,
    addStudent,
    updateStudent,
    deleteStudent,
    addFeePayment,
    importStudents,
    dismissError,
    forceSync: fetchFromCloud
  };
};

