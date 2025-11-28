import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'admission', 'data', 'tc'
  const [view, setView] = useState('list'); // 'list' or 'form' (for student management)
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  // Student Management Handlers
  const handleAddClick = () => {
    setEditingStudent(null);
    setView('form');
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setView('form');
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
    setView('list');
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
    setView('list');
    setEditingStudent(null);
  };

  const handleImportSuccess = (importedData) => {
    setStudents(importedData);
    alert('Data imported successfully!');
  };

  // Render Content based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview students={students} />;
      case 'admission':
        return <AdmissionStatus students={students} />;
      case 'tc':
        return <TransferCertificate students={students} onUpdateStudent={handleUpdateStudent} />;
      case 'data':
        return <DataManagement students={students} onImportSuccess={handleImportSuccess} />;
      case 'students':
        return view === 'list' ? (
          <StudentList
            students={students}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onPayFee={handlePayFee}
          />
        ) : (
          <StudentForm
            onSave={handleSave}
            onCancel={handleCancel}
            initialData={editingStudent}
          />
        );
      default:
        return <Overview students={students} />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', flexShrink: 0, padding: '16px' }}>
        <Sidebar activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          setView('list'); // Reset view when switching tabs
        }} />
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
