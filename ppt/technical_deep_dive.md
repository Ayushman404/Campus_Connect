# 🚀 Campus Connect: Technical Architecture & Feature Guide

This document provides a deep dive into the engineering behind the **Campus Connect Unified Platform**. It explains both the user-facing benefits and the technical implementations that make them possible, using intuitive terminology.

---

## 🚌 Live Transit System

### 1. Student Experience: Instant Visibility
**Purpose:** To eliminate the uncertainty of intra-campus travel by providing live bus locations.
**Implementation:** The frontend map subscribes to a **Live Communication Bridge**. This allows the map to update the position of bus markers the moment new data arrives, without the student ever needing to refresh the page. This creates a "pulse" of the campus that is visible to every user.

### 2. Driver App: Persistent Telemetry
**Purpose:** To ensure drivers can share their location with zero friction.
**Implementation:** The app uses **Local Data Persistence** (via `AsyncStorage`) to store the driver's profile (Name, Phone, Bus Number). This means the driver only registers once; for every future shift, they simply tap "Start Streaming" to begin their mission.

### 3. The Tracking Engine (Tech Deep Dive)
- **Live Bridge:** A high-speed data link between the Driver App and the Backend that bypasses traditional slow request cycles.
- **Precision GPS:** Captures high-accuracy coordinates every 2 seconds to ensure the map matches the real world.
- **Background Stability:** The system is built to maintain the connection even when the driver's phone screen is off or they are handling other tasks.

---

## 🛒 Student Marketplace (Buy, Sell, & Rent)

### 4. Effortless Listing Workflow
**Purpose:** To provide a professional, organized space for campus commerce.
**Implementation:**
- **Snap & Showcase:** Sellers can upload up to 5 photos. The system handles **Image Orchestration**, automatically resizing and serving them to ensure the marketplace remains fast.
- **Set Your Terms:** A simplified form allows students to choose between Selling or Renting, instantly reaching the entire university community.

### 5. Smart Management & Negotiation
**Purpose:** To facilitate secure, instant communication and clean marketplace management.
**Implementation:**
- **Messaging Engine:** A built-in chat system that uses a **Live Link** to deliver messages instantly. It creates a private channel for every deal, keeping personal numbers confidential.
- **One-Tap Actions:** When a deal is done, the seller uses the "Mark as Sold" tool. This triggers an **Atomic Transaction** in the database that archives the listing and updates stock in a single, safe operation.

---

## 🛠️ The Core Tech Stack

- **Web & UI:** React 18, Vite, and Tailwind CSS for a premium, fast frontend.
- **Mobile:** Expo & React Native for cross-platform driver telemetry.
- **Backend & Data:** Node.js, Express, and PostgreSQL (via Prisma ORM).
- **Infrastructure:** Fully containerized via Docker for consistent deployment and performance.

---
*Created for the IIT Patna Sem 4 IT Project - Campus Connect.*
