import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getStudents, saveStudents, addStudent as localAddStudent, updateStudent as localUpdateStudent, deleteStudent as localDeleteStudent, addFeePayment as localAddFeePayment } from '../utils/storage';
import { denormalizeStudents, normalizeStudent } from '../utils/syncHelpers';
import { useAuth } from '../context/AuthContext';

export const useDataSync = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(getStudents());
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error', 'unsaved'
  const [syncError, setSyncError] = useState(null);

  // Load from Supabase on mount/auth change
  useEffect(() => {
    if (!user || !supabase) {
      setStudents(getStudents());
      setSyncStatus('synced');
      return;
    }

    let isMounted = true;

    const fetchFromCloud = async () => {
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const { data: studentsData, error: sError } = await supabase.from('students').select('*');
        if (sError) throw sError;

        const { data: feesData, error: fError } = await supabase.from('fees').select('*');
        if (fError) throw fError;

        // "Online Source is Truth" - Always overwrite local with cloud data if connection is successful.
        // Even if Cloud is empty, we assume that's the truth.
        if (isMounted) {
          const merged = denormalizeStudents(studentsData, feesData);
          saveStudents(merged);
          setStudents(merged);
          setSyncStatus('synced');
        }

      } catch (err) {
        if (isMounted) {
          console.error("Sync error:", err);
          setSyncStatus('error');
          setSyncError({
            message: "Failed to load data from server. Please check your connection.",
            details: err
          });

          setTimeout(() => {
            if (isMounted && syncStatus === 'error') {
              setSyncStatus('unsaved');
            }
          }, 5000);
        }
      }
    };

    fetchFromCloud();

    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  const addStudent = useCallback(async (studentData) => {
    const id = crypto.randomUUID();
    const newStudent = { ...studentData, id };

    // 1. Local Update (Optimistic)
    const updatedList = localAddStudent(newStudent);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
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
  }, [user, supabase]);

  const updateStudent = useCallback(async (studentData) => {
    // 1. Local Update
    const updatedList = localUpdateStudent(studentData);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { student, fees } = normalizeStudent(studentData);

        const { error } = await supabase.from('students').upsert(student);
        if (error) throw error;

        if (fees.length > 0) {
          const { error: delError } = await supabase.from('fees').delete().eq('student_id', studentData.id);
          if (delError) throw delError;

          const { error: fError } = await supabase.from('fees').insert(fees);
          if (fError) throw fError;
        }

        setSyncStatus('synced');
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
  }, [user, supabase]);

  const deleteStudent = useCallback(async (id) => {
    // 1. Local Update
    const updatedList = localDeleteStudent(id);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        setSyncStatus('synced');
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
  }, [user, supabase]);

  const addFeePayment = useCallback(async (studentId, paymentDetails) => {
    // paymentDetails can be object or array
    const payments = Array.isArray(paymentDetails) ? paymentDetails : [paymentDetails];

    // Assign IDs locally
    const paymentsWithIds = payments.map(p => ({ ...p, id: crypto.randomUUID(), student_id: studentId }));

    // 1. Local Update
    const updatedList = localAddFeePayment(studentId, paymentsWithIds);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
      return;
    }

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { fees } = normalizeStudent({ id: studentId, feeHistory: paymentsWithIds });

        const { error } = await supabase.from('fees').insert(fees);
        if (error) throw error;
        setSyncStatus('synced');
    } catch (err) {
        console.error("Cloud fee error", err);
        setSyncStatus('error');

        let userMessage = "Failed to save fee payment to server.";
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
  }, [user, supabase]);

  const importStudents = useCallback(async (newStudents) => {
    // 1. Local Update (Full Replace)
    saveStudents(newStudents);
    setStudents(newStudents);
    setSyncStatus('unsaved');

    if (!user || !supabase) {
      console.warn("Supabase not configured - changes saved locally only");
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
  }, [user, supabase]);

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
    forceSync: () => importStudents(students)
  };
};
