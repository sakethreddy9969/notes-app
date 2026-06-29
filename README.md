# 📒 Industrial Full-Stack Notes Application

This project is a high-fidelity, production-grade full-stack Notes application. It uses a modern decoupled architecture, pairing a robust **PHP Laravel REST API** backend with a state-of-the-art **Glassmorphism Single Page Application (SPA)** frontend built with premium styling and animations.

---

## 🎨 Design & Aesthetics

The application features a premium dark-themed **Obsidian Space** design with a **Slate Light** theme option. Key aesthetic elements include:
*   **Glassmorphism**: Translucent panels with a high-end frosted glass appearance (`backdrop-filter: blur(16px)`), fine border rules, and depth shadows.
*   **Tailored Color Palettes**: Gradient accents using deep space indigo, glowing cyan, emerald green, and soft rose. No flat, browser-default colors are used.
*   **Micro-Animations**: Smooth visual transitions for all interactive elements (hover states, form focus, toast entries, skeleton loader state, and modal reveals).
*   **Typography**: Clean, professional tech styling using the modern Google Font **Outfit**.

---

## 🚀 Key Industrial Features

1.  **Token-Based Sessionless Authentication**: Uses Laravel Sanctum Bearer tokens stored securely in `localStorage`. Avoids session domain and CSRF cookie collision issues, allowing decoupled operations across different ports/hosts.
2.  **Strict Security Control**: User-isolated databases. Users can only fetch, view, edit, or delete notes they own.
3.  **Public Note Link Sharing**: Toggle note visibility between Private (default) and Public. Notes marked as Public generate a unique shareable link.
4.  **Decoupled Public Viewer (`view.html`)**: An unauthenticated page that allows third parties to read shared public notes cleanly without needing a login session. Private notes remain blocked.
5.  **Dynamic Workspace Statistics**: Real-time statistical counters computing Total Notes, Private Notes, Public Notes, and Unique Tags.
6.  **Interactive Category Filtering**: Extracting tags dynamically from user input. Clicking tag pills on note cards or in the sidebar filters the workspace instantly.
7.  **Real-Time Search**: Instant local fuzzy search over titles, body content, and tags.
8.  **Toast Notification Alerting**: Custom CSS-based popup alert system for non-blocking feedback during creation, login, validation, or delete operations.
9.  **Rich-Text Formatter**: Powered by Quill.js with styling customized to match the obsidian glass theme.

---

## 🧰 Technology Stack

*   **Backend API**: Laravel 9+, PHP 8.1+, Laravel Sanctum (Token Auth).
*   **Database**: SQLite (local persistence, zero configuration).
*   **Frontend SPA**: HTML5, CSS3 Variables, Vanilla ES6 JavaScript, Bootstrap 5 (Base Grid), FontAwesome 6 (Icons), Quill.js (Rich Editor).

---

## 💻 Quick Setup Instructions

Follow these steps to run the application locally on your computer.

### 1. Set Up the Backend API

Make sure you have PHP and Composer installed, then run the following in your terminal:

```bash
# Navigate to the Laravel project directory
cd online-notes-app

# Copy the environment file template
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations to build SQLite schema (creates database automatically)
php artisan migrate

# Start the Laravel local development server
php artisan serve
```

The backend API will start running on **`http://localhost:8000`**.

### 2. Run the Frontend SPA

Since the frontend is a decoupled static web app, you must serve it using a local HTTP server:

*   **VS Code**: Right-click `login.html` and choose **"Open with Live Server"** (runs on `http://127.0.0.1:5500`).
*   **Node/npm**: Run `npx serve` in the project root folder.
*   **Python**: Run `python -m http.server 5500` in the project root folder.

Open your browser and navigate to the local address (e.g., `http://127.0.0.1:5500/login.html`).

---

## 📂 Project Structure

```
notes-app/
├── online-notes-app/        # Backend Laravel API Project
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── ApiAuthController.php  # Token registration, login, logout
│   │   │   └── NoteController.php     # Note CRUD and Public sharing
│   │   └── Models/
│   │       ├── Note.php
│   │       └── User.php
│   ├── config/
│   │   ├── cors.php                  # Pre-configured CORS policies for ports
│   │   └── database.php              # SQLite default configuration
│   ├── database/
│   │   ├── database.sqlite           # SQLite database file
│   │   └── migrations/
│   │       └── ..._create_notes_table.php # Migration schema definition
│   └── routes/
│       └── api.php                   # API route definitions
│
├── login.html               # Authentication login interface
├── register.html            # Authentication registration interface
├── dashboard.html           # Main notes workspace layout
├── view.html                # Shared note unauthenticated reader
├── script.js                # Core API client & SPA interactive router
├── style.css                # Premium glassmorphic stylesheet
└── README.md                # Project documentation (this file)
```
