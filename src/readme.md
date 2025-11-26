PharmaGo - Online Pharmacy
Introduction

PharmaGo is a modern online pharmacy platform that allows users to browse, search, and purchase medicines and healthcare products conveniently. The goal is to provide a seamless and secure experience for patients to access essential medicines from the comfort of their homes. The platform emphasizes usability, accessibility, and trustworthiness with a clean UI and intuitive navigation.

Project Type

Frontend

Deployed App

Frontend: https://pharmago-vert.vercel.app/

Directory Structure
pharmago/
├─ public/
├─ src/
│  ├─ components/   # Reusable UI components
│  ├─ pages/        # Main page views
│  ├─ assets/       # Images, icons, etc.
│  ├─ App.jsx
│  ├─ main.jsx
└─ package.json

Video Walkthrough of the Project

🎥 https://drive.google.com/file/d/1q1_ecLqzx92vwITkGfRjbjWJIHJit4tb/view?usp=sharing



Features

🏠 Modern and responsive homepage with featured medicines and categories

🔍 Search functionality to quickly find medicines

🛒 Shopping cart to add/remove items before purchase

📦 Product detail view with description and price

🌗 Light/Dark mode toggle for better accessibility

📱 Fully responsive design for mobile, tablet, and desktop

Design Decisions & Assumptions

Focused only on frontend implementation for this phase

Backend and database can be integrated in the future (e.g., Node.js + MongoDB)

Assumed static product data for demo purposes

Designed for simplicity and ease of navigation

Installation & Getting Started

Clone the repository and run locally:

# Clone repo
git clone https://github.com/your-username/pharmago.git
cd pharmago

# Install dependencies
npm install

# Run the app
npm run dev

Usage
# Start the development server
npm run dev


Open http://localhost:5173
 in your browser

Browse medicines, search products, and test cart functionality

Include screenshots of Homepage, Product List, Cart, and Checkout as needed.

Credentials

No authentication required for current version

Future version may include login for patients & pharmacists

APIs Used

firebase

API Endpoints

❌ Not applicable for this frontend-only project

Technology Stack

⚛️ React + Vite

🎨 Tailwind CSS

🔄 Context API for state management

🚀 Vercel (Deployment)