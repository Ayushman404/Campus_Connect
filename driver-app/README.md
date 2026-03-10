# Driver App (Expo)

This is the **driver mobile application** for the Campus Connect project.
It sends the driver's **live GPS location** to the backend using **Socket.IO**.



---

## Requirements

* Node.js
* Expo Go app (Android / iOS)
* Backend server running locally

---

## Setup

### 1. Install dependencies

```
cd driver-app
npm install
```

### 2. Update backend IP address

Open:

```
driver-app/app/(tabs)/index.tsx
```

Update this line with your **local machine IP**:

```
const socket = io("http://YOUR_IP:5000")
```

Example:

```
const socket = io("http://192.168.1.20:5000")
```

Find your IP with:

```
ipconfig
```

Look for **IPv4 Address**.

---

### 3. Start the Expo server

```
npx expo start --lan
```

Scan the QR code with **Expo Go** on your phone.

---

## Backend Integration

The app sends location updates using the following socket event:

```
driverLocationUpdate
```

Payload format:

```
{
  busId: "IITP-BUS-01",
  lat: number,
  lng: number,
  timestamp: string
}
```

The backend must listen for:

```
socket.on("driverLocationUpdate", ...)
```

---

## How it works

```
Phone GPS
   ↓
Expo Location API
   ↓
Socket.IO emit
   ↓
Backend server
   ↓
Database
   ↓
Frontend map
```

---

## Testing

1. Start backend:

```
docker compose up
```

2. Start frontend:

```
cd frontend
npm run dev
```

3. Run driver app and scan QR.

You should see backend logs like:

```
Persisted IITP-BUS-01 to DB
```

indicating successful location updates.
