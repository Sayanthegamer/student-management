# Student Manager Pro

A web-based student management application designed to help schools track student records, manage fee collections, and handle admissions.

## 🌟 Features

- **Student Records Management:** Add, edit, delete, search, and filter student profiles.
- **Fee Tracking:** Record monthly fee payments, track payment history, and calculate late fines.
- **Admissions Workflow:** Manage and track admission applications (Pending, Confirmed, Provisional).
- **Data Export/Import:** Export student data to CSV for backups or reporting, and import data from CSV files.
- **Role-based Auth:** Uses Supabase Authentication to manage user access.

## 🏗️ Tech Stack

- **Frontend Framework:** React 19, Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **Icons:** Lucide React
- **Backend & Auth:** Supabase (PostgreSQL, GoTrue)

## 🗄️ Architecture & Data Storage

Student Manager Pro implements an optimistic UI architecture using a dual-layer storage approach:

1. **Local Cache (`sessionStorage`):** Changes are immediately written to browser `sessionStorage` (key: `student_management_session_v1`) to provide instant UI feedback without waiting for network responses. **Note:** This is not a full offline mode; closing the browser tab or clearing the session will discard unsaved local changes if they haven't synced.
2. **Remote Persistence (Supabase):** The application synchronizes the local cache with a Supabase PostgreSQL database following data changes (via CRUD handlers like `addStudent`, `updateStudent`, `deleteStudent`, `addFeePayment`, `importStudents`) and on component mount. A UI indicator shows the current sync status.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (This project uses `pnpm` exclusively; do not use `npm` or `yarn`)
- A Supabase project

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sayanthegamer/student-management.git
   cd student-management
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
src/
├── components/     # Reusable React components and UI elements
├── hooks/          # Custom React hooks (e.g., useDataSync, useDebounce)
├── context/        # React Context providers (e.g., AuthContext)
├── lib/            # External library configurations (e.g., Supabase client)
├── utils/          # Helper functions (storage, sync logic, CSV parsing)
├── App.jsx         # Main application component and routing configuration
└── main.jsx        # Application entry point
```

## 📜 Available Scripts

- `pnpm dev`: Starts the Vite development server.
- `pnpm build`: Builds the application for production.
- `pnpm preview`: Locally previews the production build.
- `pnpm lint`: Runs ESLint to check for code quality issues.

## 📄 License

This project is open source and available under the **MIT License**. See the `LICENSE` file for more details.

## 👨‍💻 Author

Made with ❤️ by Sayan (with some help from Google Gemini).
