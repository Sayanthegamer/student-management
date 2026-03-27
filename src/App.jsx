import React, { useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { useDataSync } from './hooks/useDataSync';
import SyncIndicator from './components/SyncIndicator';
import SyncErrorModal from './components/SyncErrorModal';
import SkeletonLoader from './components/SkeletonLoader';

const LandingPage = lazy(() => import('./components/LandingPage'));

// Lazy Load Components for Performance
const Overview = lazy(() => import('./components/Overview'));
const StudentList = lazy(() => import('./components/StudentList'));
const StudentForm = lazy(() => import('./components/StudentForm'));
const AdmissionStatus = lazy(() => import('./components/AdmissionStatus'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const TransferCertificate = lazy(() => import('./components/TransferCertificate'));
const PaymentHistory = lazy(() => import('./components/PaymentHistory'));
const Walkthrough = lazy(() => import('./components/Walkthrough'));

function App() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const { students, syncStatus, syncError, addStudent, updateStudent, deleteStudent, addFeePayment, importStudents, dismissError, forceSync } = useDataSync();
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // student id to confirm delete
  const navigate = useNavigate();
  const location = useLocation();
  const showMobileAdd = location.pathname === '/students';

  // Student Management Handlers
  const handleAddClick = useCallback(() => {
    setEditingStudent(null);
    navigate('/students/new');
  }, [navigate]);

  const handleEditClick = useCallback((student) => {
    setEditingStudent(student);
    navigate('/students/edit');
  }, [navigate]);

  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteStudent(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteStudent]);

  const handleSave = useCallback((studentData) => {
    if (editingStudent) {
      updateStudent({ ...studentData, id: editingStudent.id });
    } else {
      addStudent(studentData);
    }
    navigate('/students');
  }, [editingStudent, updateStudent, addStudent, navigate]);

  const handleUpdateStudent = useCallback((updatedStudent) => {
    updateStudent(updatedStudent);
  }, [updateStudent]);

  const handlePayFee = useCallback((studentId, paymentDetails) => {
    addFeePayment(studentId, paymentDetails);
  }, [addFeePayment]);

  const handleCancel = useCallback(() => {
    setEditingStudent(null);
    navigate('/students');
  }, [navigate]);

  const handleImportSuccess = useCallback((importedData) => {
    importStudents(importedData);
    showToast('Data imported and synced successfully!', 'success');
  }, [importStudents, showToast]);

  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (syncStatus !== 'synced') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStatus]);

  if (loading) {
    return <SkeletonLoader />;
  }

  // Handle unauthenticated routes explicitly
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
           <Suspense fallback={<SkeletonLoader />}>
               <LandingPage />
           </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <ErrorBoundary>
      <SyncErrorModal error={syncError} students={students} onDismiss={dismissError} />
      <div className="app-container flex h-[100dvh] overflow-hidden bg-[#050505] text-[#e0e0e0]">
        {/* Mobile Header - Simplified */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0a0a0a] border-b border-white/40 z-30 flex items-center px-4 justify-between pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))]">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-widest uppercase text-white text-base">STD::MGR</span>
          </div>
          <div className="flex items-center gap-2">
            {showMobileAdd && (
              <button
                onClick={handleAddClick}
                className="p-2 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors touch-manipulation"
                aria-label="Add student"
              >
                <Plus size={20} className="stroke-[3px]" />
              </button>
            )}
            <SyncIndicator status={syncStatus} onSync={forceSync} />
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block md:relative md:w-[260px] md:z-0 flex-shrink-0 md:p-4">
          <Sidebar onClose={() => { }} syncStatus={syncStatus} onSync={forceSync} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <Suspense fallback={<SkeletonLoader />}>
            <Walkthrough />
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview students={students} onAddStudent={handleAddClick} />} />
              <Route path="/students" element={
                <StudentList
                  students={students}
                  onAdd={handleAddClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onPayFee={handlePayFee}
                />
              } />
              <Route path="/students/new" element={
                <StudentForm
                  onSave={handleSave}
                  onCancel={handleCancel}
                  initialData={null}
                />
              } />
              <Route path="/students/edit" element={
                <StudentForm
                  onSave={handleSave}
                  onCancel={handleCancel}
                  initialData={editingStudent}
                />
              } />
              <Route path="/payment-history" element={<PaymentHistory students={students} />} />
              <Route path="/admission" element={<AdmissionStatus students={students} onUpdateStudent={handleUpdateStudent} user={user} />} />
              <Route path="/tc" element={<TransferCertificate students={students} onUpdateStudent={handleUpdateStudent} user={user} />} />
              <Route path="/data" element={<DataManagement students={students} onImportSuccess={handleImportSuccess} />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNavigation />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#050505] border-2 border-white/40 max-w-sm w-full p-8 scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Delete Student?</h3>
            <p className="text-white/60 font-mono text-xs mb-8">This action cannot be undone. The student record and all associated data will be permanently removed.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border-2 border-white/40 text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-rose-500 text-black font-black uppercase tracking-wider hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </ErrorBoundary>
  );
}

export default App;
