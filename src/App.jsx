import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import AdmissionStatus from './components/AdmissionStatus';
import DataManagement from './components/DataManagement';
import TransferCertificate from './components/TransferCertificate';
import { getStudents, addStudent, updateStudent, deleteStudent, addFeePayment } from './utils/storage';

function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStudents(getStudents());
  }, []);

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
    <div className="app-container flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] flex-shrink-0 p-4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
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
          <Route path="/admission" element={<AdmissionStatus students={students} />} />
          <Route path="/tc" element={<TransferCertificate students={students} onUpdateStudent={handleUpdateStudent} />} />
          <Route path="/data" element={<DataManagement students={students} onImportSuccess={handleImportSuccess} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
