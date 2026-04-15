# 🚀 Campus Connect - IITP Super-App

Welcome to the **Campus Connect** repository! This is the central hub for the IIT Patna Super-App. This platform features **Live Bus Navigation** with real-time telemetry, and a full-fledged **Student Marketplace** for buying and selling items with real-time sockets-based chat.

This project uses a hybrid architecture:
* **Backend & Database:** Fully Dockerized (Node.js + Express + PostgreSQL + Prisma). You will never need to install a database directly on your laptop.
* **Frontend:** Runs locally (Vite + React + Tailwind + Socket.io) for maximum speed and hot-reloading.

---

## 🛠️ Prerequisites (Do this once)

Before you clone the code, ensure you have the following installed on your machine:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: The engine that runs our backend and database. **Must be open and running in the background before you start coding.**
2. **[Node.js](https://nodejs.org/)**: (v18 or v22) Required to run the React frontend and local scripts.
3. **[Git](https://git-scm.com/)**: To clone and manage the repository.
4. **VS Code**: Recommended editor (install the *Prisma* extension for syntax highlighting).

---

## 🏃‍♂️ Step-by-Step Setup Guide

Follow these steps exactly to get the project running on your machine for the first time.

### Step 1: Clone & Configure
Clone the repository and open it in VS Code.
```bash
git clone https://github.com/Ayushman404/Campus_Connect.git
cd Campus_Connect
```

**Create a file named `.env` in the root directory of the project. Ask the team lead for the secret keys, or use the template below:**

```bash
# .env
POSTGRES_USER=admin
POSTGRES_PASSWORD=campus_secure
POSTGRES_DB=campus_db
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

### Step 2: Fire Up the Docker Engine
Open a terminal in the root directory and run the orchestrator.
This will pull PostgreSQL and Node.js, install backend dependencies, and link everything together.
```bash
docker-compose up -d --build
```
> Note: The `-d` flag runs it in the background. It might take a minute or two the first time.

### Step 3: Initialize the Database (Prisma)
Now we need to create the tables in our empty database and inject the official IITP bus schedule.

**Run these commands one by one:**

Create the tables:
```bash
docker exec -it campus_backend npx prisma migrate dev
```

Inject the campus data (Aryabhatta, Block 9, etc.):
```bash
docker exec -it campus_backend node seed-location.js
```

### Step 4: Start the Frontend UI
The UI runs outside of Docker so it's blazing fast. Open a new terminal tab, navigate to the frontend folder, install the packages, and start it:
```bash
cd frontend
npm install
npm run dev
```
**👉 Open `http://localhost:5173` (or whatever port Vite gives you) in your browser.**

---

## 🧪 How to Test the Features

### Testing the Live Bus (Simulation)
Since we don't have the physical driver app running yet, we use a simulation script to make the bus move on the map.
Ensure your Docker containers are running. Open a terminal in the backend folder.
**Run the mock driver:**
```bash
cd backend
node mock-driver.js
```
Watch your frontend map—the bus will start driving its route!

### Testing the Marketplace
Users can upload products, view listings, and negotiate via real-time WebSocket chats. Make sure to create at least two users (buyer and seller) in separate browser sessions to test real-time chat updates properly!

---

## 🔍 Essential Developer Commands 
Keep this cheat sheet handy. You will use these commands daily.

* **Start everything**: `docker-compose up -d` (in root)
* **Stop everything**: `docker-compose down` (in root)
* **View Backend Logs**: `docker-compose logs -f backend`
* **Reset Database completely**: `docker exec -it campus_backend npx prisma migrate reset --force`
* **Re-seed bus schedule** (after editing `real-schedule.json`): `docker-compose exec backend node seed-location.js`
* **Open Prisma Studio** (visual DB browser at `http://localhost:5555`): `docker-compose exec backend npx prisma studio`
* **Run database migrations**: `docker-compose exec backend npx prisma migrate deploy`

---

## 🚌 Driver App Setup (Expo / React Native)

The driver app streams live GPS telemetry to the backend over WebSockets.

### Configure the server URL
Create a `.env` file inside the `driver-app/` folder (use `.env.example` as a template):
```bash
# driver-app/.env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000
```
> Replace `<your-local-ip>` with your computer's LAN IP (e.g. `192.168.1.42`).
> The phone and computer must be on the same Wi-Fi network.

### Run the app
```bash
cd driver-app
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on the driver's phone.

---

## 🗺️ Bus Map — How it Works

The campus map shows estimated bus positions even when a driver is not actively streaming GPS. The frontend uses **dead reckoning**:

1. **🟠 Live GPS** — Driver app is actively streaming. Bus marker pulses orange.
2. **🔵 Estimated** — No live signal, but bus is mid-trip or waiting for an upcoming departure (within 60 min). Position is interpolated between stops based on elapsed time and known route durations.
3. **⚫ No Active Trip** — Bus has no scheduled trip nearby. No marker shown.

### Approximate campus route durations (used for estimation)
| Route | Time |
|---|---|
| Aryabhatta ↔ Tut Block | ~10 min |
| Aryabhatta ↔ D Quarters | ~8 min |
| Aryabhatta ↔ Bihar Museum (Patna) | ~150 min (2.5 hr) |