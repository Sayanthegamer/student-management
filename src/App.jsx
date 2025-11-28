import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { getStudents, addStudent, updateStudent, deleteStudent, addFeePayment } from './utils/storage';

// Lazy Load Components for Performance
const Overview = lazy(() => import('./components/Overview'));
const StudentList = lazy(() => import('./components/StudentList'));
const StudentForm = lazy(() => import('./components/StudentForm'));
const AdmissionStatus = lazy(() => import('./components/AdmissionStatus'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const TransferCertificate = lazy(() => import('./components/TransferCertificate'));
const PaymentHistory = lazy(() => import('./components/PaymentHistory'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-indigo-600 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

function App() {
  const [students, setStudents] = useState(getStudents());
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();

  // Student Management Handlers
  const handleAddClick = () => {
    setEditingStudent(null);
    navigate('/students/new');
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    navigate('/students/edit');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const updated = deleteStudent(id);
      setStudents(updated);
    }
  };

  const handleSave = (studentData) => {
    if (editingStudent) {
      const updated = updateStudent({ ...studentData, id: editingStudent.id });
      setStudents(updated);
    } else {
      const updated = addStudent(studentData);
      setStudents(updated);
    }
    navigate('/students');
  };

  const handleUpdateStudent = (updatedStudent) => {
    const updated = updateStudent(updatedStudent);
    setStudents(updated);
  };

  const handlePayFee = (studentId, paymentDetails) => {
    const updated = addFeePayment(studentId, paymentDetails);
    setStudents(updated);
  };

  const handleCancel = () => {
    setEditingStudent(null);
    navigate('/students');
  };

  const handleImportSuccess = (importedData) => {
    setStudents(importedData);
    alert('Data imported successfully!');
  };

  return (
    <ErrorBoundary>
      <div className="app-container flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-[260px] flex-shrink-0 p-4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <Suspense fallback={<PageLoader />}>
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
