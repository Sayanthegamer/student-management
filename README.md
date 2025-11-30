# Student Manager Pro

A comprehensive student management application built with React and Vite. This system provides professional-grade tools for managing student records, tracking fee payments, handling admissions, and issuing transfer certificates.

## ✨ Features

### 📊 Dashboard Overview
- **Recent Activities Log**: Real-time tracking of all system actions (Admissions, Fees, TCs)
- Real-time statistics for total students, active students, and pending admissions
- Fee collection tracking with total collected and pending amounts
- Quick access to recent admissions and payment history
- Visual indicators for key metrics

### � Interactive Walkthrough
- **Guided Tour**: A built-in interactive tour for new users to learn the application features step-by-step.
- **Spotlight Highlighting**: Visual cues to guide users to important buttons and sections.

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