import React, { useState, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './hooks/useDataSync';
import SyncIndicator from './components/SyncIndicator';
import SyncErrorModal from './components/SyncErrorModal';
import SkeletonLoader from './components/SkeletonLoader';

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
  const { students, syncStatus, syncError, addStudent, updateStudent, deleteStudent, addFeePayment, importStudents, dismissError } = useDataSync();
  const [editingStudent, setEditingStudent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(id);
    }
  }, [deleteStudent]);

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
    alert('Data imported and synced successfully!');
  }, [importStudents]);

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <ErrorBoundary>
      <SyncErrorModal error={syncError} students={students} onDismiss={dismissError} />
      <div className="app-container flex h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">Student Manager</span>
          </div>
          <SyncIndicator status={syncStatus} />
        </div>

        {/* Mobile Sidebar Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-[280px] md:relative md:w-[260px] md:z-0 flex-shrink-0 md:p-4
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} syncStatus={syncStatus} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0 w-full">
          <Suspense fallback={<SkeletonLoader />}>
            <Walkthrough
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview students={students} />} />
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
              <Route path="/admission" element={<AdmissionStatus students={students} onUpdateStudent={handleUpdateStudent} />} />
              <Route path="/tc" element={<TransferCertificate students={students} onUpdateStudent={handleUpdateStudent} />} />
              <Route path="/data" element={<DataManagement students={students} onImportSuccess={handleImportSuccess} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
