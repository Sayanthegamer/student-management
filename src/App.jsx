import React, { useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Menu, Zap, GraduationCap } from 'lucide-react';
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

/**
 * Root application component - Kinetic Ledger Shell
 * Refined layout with compact editorial header for maximum data space
 */
function App() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const { students, syncStatus, syncError, addStudent, updateStudent, deleteStudent, addFeePayment, importStudents, dismissError, forceSync } = useDataSync();
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
    return addFeePayment(studentId, paymentDetails);
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
      <>
        <div className="noise-overlay" aria-hidden="true" />
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
      </>
    );
  }

  return (
    <ErrorBoundary>
      <SyncErrorModal error={syncError} students={students} onDismiss={dismissError} />
      <div className="app-container flex h-[100dvh] overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-sans">
        {/* Noise Overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Mobile Header - Kinetic Ledger style */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))] bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
              <GraduationCap size={16} className="text-[var(--accent-primary)]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight">Kinetic Ledger</span>
              <Zap size={10} className="text-[var(--accent-primary)] fill-current" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showMobileAdd && (
              <button
                onClick={handleAddClick}
                className="p-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors touch-target active:scale-95"
                aria-label="Add student"
              >
                <Plus size={18} className="stroke-[2px]" />
              </button>
            )}
            <SyncIndicator status={syncStatus} onSync={forceSync} />
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block md:relative md:w-[220px] md:z-0 flex-shrink-0 bg-[var(--bg-sidebar)]">
          <Sidebar onClose={() => { }} syncStatus={syncStatus} onSync={forceSync} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 bg-[var(--bg-main)]">

          {/* Global Header - Compact Editorial */}
          <div className="hidden md:block relative w-full border-b border-[var(--border-subtle)] overflow-hidden">
            {/* Subtle gradient accent */}
            

            <div className="w-full px-8 py-5">
              {/* Compact asymmetrical layout */}
              <div className="flex items-center justify-between gap-6">
                {/* Left - Brand mark */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-xl shadow-[var(--accent-primary)]/20 relative">

                    <span className="text-2xl relative">🎓</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                      Kinetic Ledger
                    </h1>
                    <p className="text-[var(--text-muted)] text-xs font-mono mt-1">
                      Record Management
                    </p>
                  </div>
                </div>
                
                {/* Right - System status & actions */}
                <div className="flex items-center gap-4">
                  {/* System status pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: syncStatus === 'synced' ? 'var(--success)' : 
                                   syncStatus === 'syncing' ? 'var(--color-warning)' :
                                   syncStatus === 'unsaved' ? '#F59E0B' : 'var(--color-negative)',
                        boxShadow: 'none'
                      }}
                    />
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      {syncStatus === 'synced' ? 'Synced' : 
                       syncStatus === 'syncing' ? 'Syncing' :
                       syncStatus === 'unsaved' ? 'Unsaved' : 'Offline'}
                    </span>
                  </div>

                  {/* Quick actions */}
                  <button
                    onClick={forceSync}
                    className="btn btn-secondary text-xs py-2 px-3"
                    disabled={syncStatus === 'syncing'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Sync
                  </button>
                  <button onClick={handleAddClick} className="btn btn-primary cta-primary text-sm py-2">
                    <Plus size={16} />
                    <span>Add Record</span>
                  </button>
                </div>
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
        <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-sm w-full p-6 kinetic-scale shadow-2xl rounded-xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">Delete Record?</h3>
            <p id="delete-confirm-desc" className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">This action cannot be undone. All associated data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger text-sm"
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