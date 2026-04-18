# 📂 Campus Connect - Project File Documentation

This document provides a detailed description of every file and folder in the **Campus Connect** project to help you navigate and understand the codebase.

---

## 🏗️ Root Directory
*   `backend/`: The Node.js server handling API requests, real-time communication, and database operations.
*   `frontend/`: The React-based web application for students.
*   `driver-app/`: The Expo/React Native mobile application for bus drivers.
*   `Campus_Connect/`: (Likely a clone artifact) Currently contains only `backend/node_modules`.
*   `.env`: Configuration file for environment variables (Database credentials, JWT secrets, etc.).
*   `docker-compose.yml`: Configuration for Docker to run the backend and PostgreSQL database in containers.
*   `README.md`: High-level overview and setup guide for the project.

---

## 🖥️ Backend (`/backend`)
Handles the "brains" of the application.

### Core Files
*   `index.js`: The entry point of the server. Initializes Express, Socket.io, and connects to the database.
*   `mock-driver.js`: A simulation script that moves a "virtual bus" on the map for testing purposes.
*   `seed-location.js`: Populates the database with initial IITP campus locations (Aryabhatta, Block 9, etc.).
*   `test-db.js`: A utility script to verify database connectivity.
*   `prisma.config.js`: Configuration for the Prisma ORM.
*   `Dockerfile`: Instructions for building the backend Docker image.

### Folders
*   `controllers/`: Logic for handling different API requests.
    *   `auth.controller.js`: User registration and login logic.
    *   `bus.controller.js`: Logic for bus schedules and real-time tracking data.
    *   `chat.controller.js`: Handles sending and retrieving marketplace messages.
    *   `notification.controller.js`: Manages system notifications for users.
    *   `product.controller.js`: Logic for creating, listing, and deleting marketplace items.
    *   `user.controller.js`: Profile management and user-related operations.
*   `routes/`: Defines the URL endpoints for the API.
    *   `auth.routes.js`, `bus.routes.js`, etc.: Map URLs to their respective controllers.
*   `middleware/`: Functions that run before the controllers.
    *   `auth.middleware.js`: Protects routes by checking for valid JWT tokens.
    *   `upload.middleware.js`: Handles file uploads (images for marketplace) using Multer.
*   `lib/`: Shared utility functions.
    *   `prisma.js`: Initializes the Prisma client for database access.
*   `prisma/`: Contains `schema.prisma` which defines the database structure (Tables for Users, Products, Messages, etc.).
*   `uploads/`: Directory where uploaded marketplace item images are stored.

---

## 🌐 Frontend (`/frontend`)
The student-facing web portal built with React and Vite.

### Core Files
*   `index.html`: The main HTML container.
*   `vite.config.js`: Configuration for the Vite build tool.
*   `package.json`: List of dependencies and scripts (`npm run dev`).

### `src/` Folder (Source Code)
*   `main.jsx`: The React entry point.
*   `App.jsx`: The main layout and routing configuration.
*   `index.css`: Global styles using Tailwind CSS.
*   **`pages/`**: Full-page components.
    *   `Dashboard.jsx`: The main landing page with the bus map and schedule.
    *   `Marketplace.jsx`: The main shop where items are listed.
    *   `ProductDetail.jsx`: Specific page for an individual item.
    *   `Chat.jsx`: Real-time chat interface for buyers and sellers.
    *   `Profile.jsx`: User profile and personal listings.
    *   `Login.jsx`: Authentication page.
*   **`components/`**: Reusable UI parts.
    *   `CampusMap.jsx`: Interactive map showing real-time bus locations.
    *   `BusSchedule.jsx`: List of upcoming bus timings.
    *   `GlobalSidebar.jsx`: Navigation menu.
    *   `MarketplaceNavbar.jsx`: Header specifically for the marketplace.
*   `context/`: React Context providers for global state (e.g., Auth status, Socket connections).
*   `hooks/`: Custom React hooks for shared logic.
*   `lib/`: Frontend utilities like API clients (Axios) and Socket configuration.

---

## 📱 Driver App (`/driver-app`)
The mobile application for bus drivers built with Expo.

### Core Files
*   `app.json`: Expo configuration file (app name, icon, splash screen).
*   `package.json`: Dependencies and Expo scripts (`npx expo start`).

### `app/` Folder (Routing)
*   `_layout.tsx`: Root layout for the app.
*   `(tabs)/`: Tab-based navigation.
    *   `index.tsx`: The main driver dashboard (telemetry toggle).
    *   `explore.tsx`: Additional info/settings.

### Folders
*   `components/`: Mobile-specific UI components (Themed text, buttons, etc.).
*   `hooks/`: Mobile-specific logic (Location tracking, Haptics).
*   `constants/`: Shared colors and layout values.
*   `assets/`: Images and fonts for the mobile app.

---

## 🐳 Docker Configuration
*   `docker-compose.yml`:
    *   `db`: Runs the PostgreSQL database.
    *   `backend`: Runs the Node.js API and links it to the `db`.

---

## 🛠️ Summary of Technologies
- **Frontend**: React, Tailwind CSS, Vite, Lucide React (icons), Leaflet (maps).
- **Backend**: Node.js, Express, Prisma ORM, Socket.io (real-time).
- **Mobile**: React Native, Expo, Expo Router.
- **Database**: PostgreSQL (via Docker).
