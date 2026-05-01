import React, { useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';
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
 * Root application component that provides the authenticated app layout, routing, and student-management handlers.
 *
 * Renders authentication-aware routes (login and public landing for unauthenticated users; full app layout for authenticated users),
 * global UI chrome (sidebar, headers, bottom navigation), sync/error handling, and routes for student workflows (listing, add/edit, payments,
 * admissions, promotions, transfer certificates, and data import).
 *
 * @returns {JSX.Element} The React element tree for the application UI, including routing, layout, sync guards, and modals. 
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

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))] bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-indigo-600 flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20 -rotate-3">
              <span className="text-sm">🎓</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] text-base tracking-tight">StdMgr</span>
          </div>
          <div className="flex items-center gap-2">
            {showMobileAdd && (
              <button
                onClick={handleAddClick}
                className="p-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors touch-manipulation active:scale-95"
                aria-label="Add student"
              >
                <Plus size={18} className="stroke-[2px]" />
              </button>
            )}
            <SyncIndicator status={syncStatus} onSync={forceSync} />
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block md:relative md:w-[240px] md:z-0 flex-shrink-0 bg-[var(--bg-sidebar)]">
          <Sidebar onClose={() => { }} syncStatus={syncStatus} onSync={forceSync} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 bg-[var(--bg-main)]">

          {/* Global Project Header - Editorial Style */}
          <div className="hidden md:block relative w-full border-b border-[var(--border-subtle)] overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 w-96 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent" />
            
            <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
              {/* Asymmetrical layout with overlapping elements */}
              <div className="flex items-start justify-between gap-8">
                {/* Left side - Logo and title stack */}
                <div className="relative">
                  <div className="absolute -left-4 -top-2 w-20 h-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg transform -rotate-6 translate-y-1 opacity-60">
                    <span className="text-3xl">🎓</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-indigo-600 flex items-center justify-center shadow-xl shadow-[var(--accent-primary)]/20 -ml-2">
                    <span className="text-2xl">🎓</span>
                  </div>
                </div>
                
                {/* Right side - Content aligned differently */}
                <div className="flex-1 pt-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tighter leading-[0.9]">
                      Student Manager Pro
                    </h1>
                    <div className="hidden lg:flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>System Online</span>
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xl">
                    The complete system for managing student records, fee payments, and admissions.
                  </p>
                </div>
              </div>
              
              {/* Action buttons - Aligned to bottom right */}
              <div className="flex items-center gap-3 mt-6 justify-end">
                <button
                  onClick={forceSync}
                  className={`btn btn-secondary text-xs ${syncStatus === 'syncing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={syncStatus === 'syncing'}
                  aria-label="Sync data with cloud"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Sync Data
                </button>
                <button onClick={handleAddClick} className="btn btn-primary cta-primary text-sm">
                  <Plus size={16} />
                  <span>Add Student</span>
                </button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] max-w-sm w-full p-6 scale-in shadow-2xl rounded-2xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">Delete Student?</h3>
            <p id="delete-confirm-desc" className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">This action cannot be undone. The student record and all associated data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
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