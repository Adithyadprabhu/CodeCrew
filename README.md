♻️ CycleX – Smart Waste Segregation System

📌 Overview

CycleX is a full-stack web application designed to improve waste management using modern web technologies and intelligent classification techniques. The platform enables users to identify and manage different types of waste efficiently through an interactive and user-friendly interface.

🚧 Problem Statement

Improper waste segregation leads to environmental pollution and inefficient recycling processes. Many users lack awareness and tools to correctly categorize and dispose of waste.

💡 Solution

This project provides a smart system that allows users to:

Upload or capture images of waste
Automatically classify waste into categories such as plastic, organic, and metal
Enable industries to sell waste materials to other industries where it can be reused, promoting a circular economy

---

## 🚀 Features

- **Role-Based Authentication:** Secure, separate workflows and dashboards tailored for Buyers and Sellers.
- **AI Material Segregation (Mock Flow):** Intelligent detection of uploaded waste images to suggest material type, quality grade, and market value.
- **Circular Marketplace:** A dynamic, real-time platform where buyers can browse, filter, and purchase recycled materials.
- **Comprehensive Listing Management:** Sellers can easily add, edit, and manage their material listings.
- **Real-Time Order & Notifications:** Instant updates and notifications when orders are placed or accepted.
- **Seller Dashboard & Analytics:** Track upload trends and marketplace activity seamlessly.

---

## 🧠 How It Works

1. **Upload & Analyze:** A seller uploads images of their waste/material.
2. **Data Storage:** The listing is saved securely in the cloud via Firebase Firestore.
3. **Marketplace Discovery:** Buyers browse the marketplace, filtering materials by type, location, and price.
4. **Order Placement:** A buyer initiates contact or places an order for a listing.
5. **Real-Time Notification:** The seller is instantly notified, accepts the order, and the transaction progresses.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Fonts:** Google Material Symbols, Inter font
- **Data Visualization:** Recharts

**Backend:**
- **Platform:** [Firebase](https://firebase.google.com/)
- **Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage (or Base64 image fallback)

---

## 📁 Folder Structure

The project is structured into two main directories to keep the architecture clean and scalable:

```text
CodeCrew/
 ├── frontend/         # Next.js application, UI components, React hooks, and App Router pages.
 │    ├── app/         # Next.js app directory (routing, pages)
 │    ├── components/  # Reusable React components (Navbar, Modals, etc.)
 │    ├── services/    # Firebase integration and API call abstractions
 │    └── lib/         # Firebase configuration and utilities
 │
 ├── backend/          # Node.js backend environment (if applicable) or Firebase functions/rules.
 │    ├── functions/   # Cloud Functions (if used)
 │    └── ...
```

---

## ⚙️ Installation & Setup

Follow these steps to get CycleX running locally on your machine.

### Prerequisites
- Node.js installed
- npm or yarn installed

### 1. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
The application will be running at `http://localhost:3000`.

### 2. Backend Setup
If you are running dedicated backend scripts or functions:

```bash
cd backend
npm install
```

---

## 🔥 Firebase Setup

To connect the application to your own database, you must configure Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Enable Authentication:** Turn on the sign-in methods you wish to use (e.g., Email/Password).
3. **Enable Firestore Database:** Create a database in test mode or with appropriate security rules.
4. **Enable Firebase Storage:** Set up a storage bucket for image uploads.
5. **Environment Variables:** Create a `.env.local` file in the `frontend` directory and add your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🌐 Deployment

CycleX is designed to be easily deployed to modern serverless platforms.

- **Frontend:** Deployed seamlessly on [Vercel](https://vercel.com/). Connect your GitHub repository to Vercel and it will automatically handle Next.js builds.
- **Backend/Database:** Hosted entirely on **Firebase** (Firestore, Auth, Storage).

---

## 📸 Screenshots

*(Add screenshots of your application here)*

| Home Page | Marketplace | Seller Dashboard |
|-----------|-------------|------------------|
| ![Home Placeholder]() | ![Market Placeholder]() | ![Dashboard Placeholder]() |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
