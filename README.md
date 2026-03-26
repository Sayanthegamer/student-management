# 👋 Welcome to Student Manager Pro!

> **The simple, modern way to manage your school's student records**

**Student Manager Pro** helps school administrators, principals, and office staff manage student information, track fee payments, process admissions, and issue transfer certificates — all from your web browser. No complicated software to install, no servers to maintain, just open and start using!

---

## 🎯 Who Is This For?

This app is designed for **anyone who manages student records at a school**:

- 👨‍💼 **School Administrators** who need a simple way to keep track of all students
- 🏫 **Principals** who want quick visibility into admissions and fee collections
- 📋 **Office Staff** who handle day-to-day student data entry and fee collection
- 💰 **Accountants/Clerks** who track monthly fees and payments

> **No technical experience required!** If you can use a web browser and a spreadsheet, you can use this app.

---

## ✨ What Can You Do With Student Manager Pro?

Here's what makes this app special:

### 📝 Student Records Management
- **Add new students** with their personal details, class, section, and roll number
- **Edit information** anytime — names, contact details, academic info
- **Delete students** who have left the school
- **Search and filter** quickly to find any student
- **Sort by name, class, admission date** — whatever you need

### 💵 Fee Tracking Made Easy
- **Track monthly fees** for each student automatically
- **Record payments** with the date, amount, and payment method
- **Automatic late fees** — the app calculates fines for overdue payments!
- **See payment history** at a glance for every student
- **Know exactly who owes money** with color-coded status indicators

### ✅ Simple Admissions Workflow
- **Review admission applications** as they come in
- **Approve or reject** applications with one click
- **Bulk actions** — approve or reject all pending applications at once
- **Track admission status** — Confirmed, Provisional, or Pending

### 📜 Transfer Certificates (TC)
- **Issue transfer certificates** for students leaving the school
- **Search for students** to find who needs a TC
- **Record the TC number, leaving date, and reason**
- **Note conduct and academic performance** right in the certificate

### 📊 Your Dashboard at a Glance
- **See recent activity** — everything that happened today
- **Quick statistics** — total students, active students, pending admissions
- **Fee overview** — total collected and total pending
- **Instant access** to recent admissions and payment history

### 🌐 Works on Any Device
- **Desktop computer** — perfect for office staff
- **Tablet** — great for principals walking around campus
- **Phone** — check things on the go
- **Responsive design** that looks good on any screen size

### 🎓 Built-in Interactive Tour
- **First time using the app?** No problem!
- **Click "Take a Tour"** to get a guided walkthrough
- **Learn as you go** with helpful highlights pointing to important buttons

---

## 🚀 Getting Started (Step by Step)

### Step 1: Open the App
Simply open your web browser (Chrome, Firefox, Safari, Edge — any modern browser works!) and navigate to the application URL. You'll see the login screen.

### Step 2: Create Your Account
- Click **Sign Up** to create your account
- Enter your email address and choose a password
- Confirm your password and click Register

> 💡 **Tip:** Use an email you check regularly — you'll need it to reset your password if you forget it!

### Step 3: Start Adding Students
Once logged in, you're ready to go! Here's how to add your first student:

1. Click **Students** in the left sidebar
2. Click the **+ Add Student** button
3. Fill in the information:
   - **Name** — student's full name
   - **Gender** — Male, Female, or Other
   - **Date of Birth** — when the student was born
   - **Class** — Play School, Nursery, KG-1, KG-2, 1, 2, 3, 4...
   - **Section** — A, B, C, etc.
   - **Roll Number** — their class roll number
   - **Parent/Guardian Details** — name and contact
   - **Fee Details** — admission fee and monthly fee amount
4. Click **Save Student**

That's it! 🎉 The student is now in your system.

---

## ☁️ How Your Data is Stored

Student Manager Pro uses a **premium dual-layer storage system** to ensure your work is lightning-fast and safely backed up. Think of it like a modern office:

1.  **The Clipboard (sessionStorage Cache):** When you make a change, it's instantly saved to a "digital clipboard" in your browser. This makes the app feel incredibly fast because you don't have to wait for a server to respond.
2.  **The Filing Cabinet (Supabase Cloud):** Moments later, the app automatically sends those changes to a secure "filing cabinet" in the cloud. This is your permanent, safe storage that works across all your devices.

### Why this is great for you:
*   **Speed:** No more "Loading..." spinners every time you click save.
*   **Safety:** Your data is automatically synced to the cloud while you work.
*   **Reliability:** If your internet drops for a moment, you can keep working. The app will catch up and sync your changes as soon as you're back online.
*   **Access Anywhere:** Log in from any computer and your students will be there waiting for you.

---

## 🔄 Understanding the Sync Indicator

At the top of your screen, you'll see a small indicator that tells you exactly what's happening with your data:

*   **🔄 Saving changes... (Indigo):** The app is currently sending your work to the cloud filing cabinet.
*   **✅ All changes saved (Green):** Your work is safely tucked away in the cloud. It's safe to close your browser.
*   **☁️ Offline mode (Red):** There's a temporary connection issue. Don't worry—your changes are still on your "clipboard" (browser cache).
*   **⚠️ Unsaved local data (Amber):** You have changes that haven't reached the cloud yet. Keep the tab open until you see the green checkmark!

---

## 📦 How to Back Up Your Data

While your data is safely stored in the cloud, we believe in **Smart Data Hygiene**. You can export your entire database at any time from the **Data Management** tab.

**Why export?**
*   **Personal Backups:** Keep a permanent record on your own computer or USB drive.
*   **Reporting:** Open your data in **Microsoft Excel** or **Google Sheets** to create custom reports or charts.
*   **Data Portability:** Your data belongs to you. You can move it to other systems whenever you like.

### 📥 How to Restore Your Data (Import)

If you need to load a backup:

1. Click **Data Management** in the sidebar
2. Click **Import Data**
3. Select the CSV file you previously exported
4. Click **Import** — your data will be restored!

---

## 💡 Quick Tips & Tricks

### Finding Students Quickly
- Use the **search box** at the top of the student list to find anyone by name
- Use **filters** to show only students in a specific class or with overdue fees

### Recording Payments Fast
- From the student list, click **Pay Fee** right on the student's card
- The app shows their payment history — no need to look it up separately

### Understanding Payment Status
- 🟢 **Paid** — All fees up to date
- 🟡 **Pending** — Payment recorded but not yet reconciled
- 🔴 **Overdue** — Past due date, may have late fees

### Automatic Fine Calculation
- When a payment is overdue, the app **automatically adds a fine**
- You can customize fine amounts in the settings if needed

### Using the Interactive Tour
- Click the **"Take a Tour"** button (usually in the welcome message or settings)
- Follow the highlights to learn each feature
- Great for training new staff members!

---

## 🔧 Troubleshooting Common Issues

### "I can't see my students after closing the browser!"
If you open the app and it looks empty, **simply log in to your account.**

Since your data is stored securely in the cloud (Supabase), it's linked to your account. Once you sign in, the app will automatically pull your "filing cabinet" from the cloud and you'll see all your students again.

If you are not using a cloud account and were relying on local storage, you can restore from a backup:
1. Click **Data Management**
2. Click **Import Data**
3. Select your backup file

### "The app is asking me to log in again"
This is normal! The app protects your data by requiring login. Just enter your email and password.

If you **forgot your password**:
1. Click **Forgot Password?**
2. Enter your email address
3. Check your email for a reset link

### "Payments aren't showing up correctly"
Make sure you're recording the payment against the **correct student**. Double-check the student name before saving.

### "The search isn't finding my student"
- Check the spelling — names must match exactly
- Try searching for just the first name or last name
- Make sure you're not in a filtered view

### "The layout looks wrong on my phone"
The app is designed to be mobile-friendly. Try:
- **Rotate your phone** to landscape mode
- **Refresh the page** to reload the styles

### "I accidentally deleted a student"
If you have a backup, you can import it to recover the student. Otherwise, you will need to add the student again. This is why **regular exports are a smart practice!**

---

## 🛠️ For Developers (Technical Details)

> ⚠️ **Skip this section if you're not technical!** The information above is everything you need to use the app.

For those interested in the technical implementation:

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Frontend user interface |
| **Vite** | Build tool and development server |
| **Tailwind CSS 4** | Styling framework |
| **Lucide React** | Icon library |
| **React Router 7** | Navigation and routing |
| **Supabase** | Cloud sync and authentication |
| **Vercel Speed Insights** | Performance analytics |

### Data Storage

- **Cache Layer**: Browser `sessionStorage` — provides an "Optimistic UI" experience for instant feedback.
- **Permanent Storage**: Supabase PostgreSQL database — the "Source of Truth" for all student records.
- **Sync Strategy**: Local-first with background cloud synchronization. Changes are reflected instantly in the UI and queued for cloud persistence.
- **Key Format**: `student_management_session_v1`
- **Data Structure**: JSON objects containing student records, fee history, and activities

### Installation for Development

```bash
# Clone the repository
git clone https://github.com/Sayanthegamer/student-management.git
cd student-management

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

### Project Structure

```
src/
├── components/     # React components (UI primitives, feature modules)
├── hooks/          # Custom React hooks (useDataSync, useWalkthrough)
├── context/        # React Context (AuthContext)
├── lib/            # External libraries (Supabase client)
├── utils/          # Storage, CSV, and sync helpers
├── App.jsx         # Main application component & routing
└── main.jsx        # Application entry point
```

### Environment Variables

Create a `.env` file with Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### CSV Data Format

Exported CSV files contain these columns:
- `id`, `name`, `class`, `section`, `rollNo`
- `feesAmount`, `feesStatus`, `fine`
- `admissionDate`, `admissionStatus`
- Plus parent/guardian and additional fields

Sample data is available in `sample_students.csv` for testing.

---

## 📝 License

This project is open source and available under the **MIT License**.

See the [LICENSE](LICENSE) file for full details.

---

## 👨‍💻 Author & Credits

**Made with ❤️ by Sayan** (with some help from Google Gemini)

---

## 🤝 Support & Feedback

Found a bug? Have a suggestion? Feel free to open an issue on GitHub!

---

## 🌟 Acknowledgments

- Built with **React** and **Vite** for optimal performance
- Icons provided by **Lucide React**
- Styled with **Tailwind CSS**
- Performance analytics by **Vercel Speed Insights**

---

*Thank you for choosing Student Manager Pro! We hope this app makes managing your school records simpler and more efficient. 🎓*
