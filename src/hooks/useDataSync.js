import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getStudents, saveStudents, addStudent as localAddStudent, updateStudent as localUpdateStudent, deleteStudent as localDeleteStudent, addFeePayment as localAddFeePayment } from '../utils/storage';
import { denormalizeStudents, normalizeStudent } from '../utils/syncHelpers';
import { useAuth } from '../context/AuthContext';

export const useDataSync = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(getStudents());
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error', 'unsaved'

  // Load from Supabase on mount/auth change
  useEffect(() => {
    if (!user) return;

    const fetchFromCloud = async () => {
      setSyncStatus('syncing');
      try {
        const { data: studentsData, error: sError } = await supabase.from('students').select('*');
        if (sError) throw sError;

        const { data: feesData, error: fError } = await supabase.from('fees').select('*');
        if (fError) throw fError;

        // Merge Strategy:
        // If Cloud has data, it wins.
        // If Cloud is empty but Local has data, we keep Local as "unsaved" so user can sync it later (or we could auto-push, but let's be safe).

        if (studentsData.length > 0 || feesData.length > 0) {
            const merged = denormalizeStudents(studentsData, feesData);
            saveStudents(merged);
            setStudents(merged);
            setSyncStatus('synced');
        } else if (students.length > 0) {
             // Cloud empty, local has data.
             setSyncStatus('unsaved');
        } else {
             setSyncStatus('synced');
        }

      } catch (err) {
        console.error("Sync error:", err);
        setSyncStatus('error');
      }
    };

    fetchFromCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addStudent = async (studentData) => {
    const id = crypto.randomUUID();
    const newStudent = { ...studentData, id };

    // 1. Local Update (Optimistic)
    const updatedList = localAddStudent(newStudent);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user) return;

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
    }
  };

  const updateStudent = async (studentData) => {
    // 1. Local Update
    const updatedList = localUpdateStudent(studentData);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user) return;

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { student } = normalizeStudent(studentData);
        // We only update the student record, not fees here
        const { error } = await supabase.from('students').upsert(student);
        if (error) throw error;
        setSyncStatus('synced');
    } catch (err) {
        console.error("Cloud update error", err);
        setSyncStatus('error');
    }
  };

  const deleteStudent = async (id) => {
    // 1. Local Update
    const updatedList = localDeleteStudent(id);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user) return;

    // 2. Cloud Update
    setSyncStatus('syncing');
    try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        setSyncStatus('synced');
    } catch (err) {
        console.error("Cloud delete error", err);
        setSyncStatus('error');
    }
  };

  const addFeePayment = async (studentId, paymentDetails) => {
    // paymentDetails can be object or array
    const payments = Array.isArray(paymentDetails) ? paymentDetails : [paymentDetails];

    // Assign IDs locally
    const paymentsWithIds = payments.map(p => ({ ...p, id: crypto.randomUUID(), student_id: studentId }));

    // 1. Local Update
    const updatedList = localAddFeePayment(studentId, paymentsWithIds);
    setStudents(updatedList);
    setSyncStatus('unsaved');

    if (!user) return;

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
    }
  };

  const importStudents = async (newStudents) => {
    // 1. Local Update (Full Replace)
    saveStudents(newStudents);
    setStudents(newStudents);
    setSyncStatus('unsaved');

    if (!user) return;

    // 2. Cloud Update (Upsert All)
    setSyncStatus('syncing');
    try {
        // We process in chunks or sequentially to avoid hitting rate limits or packet size limits
        // For simplicity, sequential loop
        for (const s of newStudents) {
            const { student, fees } = normalizeStudent(s);
            const { error: sError } = await supabase.from('students').upsert(student);
            if (sError) throw sError;

            if (fees.length > 0) {
                 const { error: fError } = await supabase.from('fees').upsert(fees);
                 if (fError) throw fError;
            }
        }
        setSyncStatus('synced');
    } catch (err) {
        console.error("Cloud import error", err);
        setSyncStatus('error');
    }
  };

  return {
    students,
    syncStatus,
    addStudent,
    updateStudent,
    deleteStudent,
    addFeePayment,
    importStudents
  };
};
