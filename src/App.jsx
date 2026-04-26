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
const PromotionBoard = lazy(() => import('./components/PromotionBoard'));
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
      <div className="app-container flex h-[100dvh] overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        {/* Mobile Header - Simplified */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] z-30 flex items-center px-4 justify-between pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] text-base">StdMgr</span>
          </div>
          <div className="flex items-center gap-2">
            {showMobileAdd && (
              <button
                onClick={handleAddClick}
                className="p-1.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-custom-md transition-colors touch-manipulation"
                aria-label="Add student"
              >
                <Plus size={18} className="stroke-[2px]" />
              </button>
            )}
            <SyncIndicator status={syncStatus} onSync={forceSync} />
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block md:relative md:w-[260px] md:z-0 flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)]">
          <Sidebar onClose={() => { }} syncStatus={syncStatus} onSync={forceSync} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 bg-[var(--bg-main)]">

          {/* Global Project Header mimicking the screenshots */}
          <div className="hidden md:block w-full border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="max-w-6xl mx-auto px-8 pt-10 pb-6 flex items-start gap-6">
              <div className="w-24 h-24 rounded-custom-2xl bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-4xl">🎓</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Student Manager Pro</h1>
                  <div className="flex items-center gap-3">
                     <button onClick={forceSync} className="btn btn-secondary">Sync Data</button>
                     <button onClick={handleAddClick} className="btn btn-primary">Add Student</button>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-2xl leading-relaxed">
                  The complete system for managing student records, fee payments, and admissions.
                </p>
              </div>
            </div>
          </div>

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
              <Route path="/promotions" element={<PromotionBoard students={students} onUpdateStudent={handleUpdateStudent} user={user} />} />
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
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-sm w-full p-6 scale-in shadow-2xl rounded-custom-xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Student?</h3>
            <p id="delete-confirm-desc" className="text-[var(--text-secondary)] text-sm mb-6">This action cannot be undone. The student record and all associated data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-custom-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 rounded-custom-md transition-colors"
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
