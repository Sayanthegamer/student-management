# Student Management System

A student management application built with React and Vite. This system provides comprehensive tools for managing student records, tracking fee payments, handling admissions, and issuing transfer certificates.

## ✨ Features

### 📊 Dashboard Overview
- Real-time statistics for total students, active students, and pending admissions
- Fee collection tracking with total collected and pending amounts
- Quick access to recent admissions and payment history
- Visual indicators for key metrics

### 👥 Student Management
- **Add/Edit Students**: Complete student information management including personal details, academic information, and fee structure
- **Student List**: Searchable and filterable list with sorting capabilities by name, roll number, class, and section
- **Student Profiles**: Detailed view of student information with payment history
- **Delete Students**: Safe deletion with confirmation prompts

### 💰 Fee Management
- **Fee Payment Processing**: Record fee payments with customizable payment methods
- **Payment History**: Comprehensive view of all fee transactions across all students
- **Fee Status Tracking**: Visual indicators for paid, pending, and overdue fees
- **Multiple Payment Methods**: Support for Cash, Bank Transfer, UPI, and Check payments
- **Payment Receipts**: Detailed payment history with transaction dates and amounts

### 🎓 Admission Management
- **Admission Status Tracking**: Monitor pending, approved, and rejected admissions
- **Bulk Actions**: Approve or reject multiple admissions at once
- **Status Filtering**: View admissions by status (All, Pending, Approved, Rejected)
- **Admission Details**: Complete applicant information with action buttons

### 📜 Transfer Certificate (TC) Module
- **Active Students View**: List of all active students with search and filter capabilities
- **TC Issuance**: Issue transfer certificates with detailed information including:
  - TC and issue date
  - Date of leaving and reason for leaving
  - Academic performance and conduct
  - Additional remarks
- **Transfer History**: View students who have been transferred out (last 3 months)
- **Status Updates**: Automatic status change when TC is issued

### 📁 Data Management
- **CSV Export**: Export all student data to CSV format for backup or external processing
- **CSV Import**: Import student data from CSV files with validation
- **Data Backup**: Easy data export for safekeeping
- **Bulk Operations**: Import multiple student records at once

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.9.6
- **Styling**: Tailwind CSS 4.1.17
- **Icons**: Lucide React 0.555.0
- **Analytics**: Vercel Speed Insights
- **Linting**: ESLint 9.39.1
- **Data Storage**: Browser LocalStorage

## 📋 Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sayanthegamer/student-management.git
   cd student-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 💾 Data Storage

The application uses browser LocalStorage to persist data. All student records, fee payments, and settings are stored locally in your browser. To backup your data:

1. Navigate to **Data Management** in the sidebar
2. Click **Export Data** to download a CSV file
3. Store the CSV file in a safe location

To restore data:
1. Navigate to **Data Management**
2. Click **Import Data**
3. Select your previously exported CSV file

## 🎯 Usage Guide

### Adding a New Student
1. Click **Students** in the sidebar
2. Click the **+ Add Student** button
3. Fill in the student details:
   - Personal Information (Name, Gender, Date of Birth, etc.)
   - Parent/Guardian Information
   - Academic Information (Class, Section, Roll Number)
   - Fee Structure (Admission Fee, Monthly Fee)
4. Click **Save Student**

### Recording Fee Payments
1. Go to **Students** list
2. Click **Pay Fee** on the student card
3. Enter payment details:
   - Payment amount
   - Payment method
   - Payment date
   - Payment notes (optional)
4. Click **Record Payment**

### Managing Admissions
1. Click **Admission Status** in the sidebar
2. View pending admissions
3. Click **Approve** or **Reject** for individual applications
4. Use **Approve All** or **Reject All** for bulk actions

### Issuing Transfer Certificates
1. Click **Transfer Certificate** in the sidebar
2. Find the student using search or filters
3. Click **Issue TC** on the student card
4. Fill in TC details:
   - TC Number
   - Date of Leaving
   - Reason for Leaving
   - Conduct and Academic Performance
5. Click **Issue Certificate**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Made with ❤️ by Sayan with some help of Google Gemini

## 🌟 Acknowledgments

- Built with React and Vite for optimal performance
- Icons provided by Lucide React
- Styled with Tailwind CSS