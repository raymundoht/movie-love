# 🎬 Movie Love - Distributed Movie Platform

**Movie Love** is a full-stack distributed web application that allows users to explore movies, get recommendations, and manage their favorite content.

The system is built using a **modern client-server architecture**, integrating a custom backend API, external movie services, and a cloud database.

---

## 🚀 Technologies Used

### Frontend

* ⚛️ React
* ⚡ Vite
* 🎨 Tailwind CSS

### Backend

* 🟢 Node.js
* 🚏 Express.js

### Database

* 🍃 MongoDB Atlas (Cloud)

### Tools

* 🧹 ESLint
* 🌐 Axios / Fetch API

---

## 🧠 System Overview

Movie Love is designed as a **distributed system composed of three main components**:

1. **Frontend Client**
2. **Backend API Service**
3. **Database (MongoDB)**

Additionally, the backend integrates **external movie APIs** to enrich the application with real-time data.

---

## 🏗️ Architecture

```bash
Frontend (React)
      ↓
Backend API (Node.js + Express)
      ↓
 ┌───────────────┬────────────────┐
 ↓               ↓                ↓
MongoDB     External APIs     External APIs
(Database)  (Movies Data)     (Recommendations)
```

### 🔁 Communication Flow

* The frontend sends HTTP requests to the backend
* The backend:

  * Processes business logic
  * Fetches data from external APIs
  * Stores and retrieves data from MongoDB
* The backend responds with structured JSON data

---

## 📂 Project Structure

```bash
movie-love/
│
├── client/                 # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server/                 # Backend (Node.js + Express)
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── models/             # MongoDB schemas
│   ├── config/             # DB connection
│   └── index.js            # Entry point
│
├── package.json
├── README.md
└── .gitignore
```

---

## ⚙️ How It Works

### 1. Frontend

* Displays movie data
* Handles user interactions
* Sends requests to backend API

### 2. Backend

* Exposes REST API endpoints:

  * `GET /api/movies`
  * `GET /api/recommendations`
  * `POST /api/favorites`
* Connects to external APIs
* Manages application logic

### 3. Database

* Stores:

  * Favorite movies
  * User-related data
* Ensures persistent storage

---

## 🌐 Deployment

| Component | Platform         | URL       |
| --------- | ---------------- | --------- |
| Frontend  | Vercel           |           |
| Backend   | Render           |           |
| Database  | MongoDB Atlas    | Cloud     |

---

## ▶️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/raymundoht/movie-love.git
cd movie-love
```

---

### 2. Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

### 3. Environment Variables

Create a `.env` file inside `/server`:

```bash
MONGODB_URI=your_mongodb_connection
API_KEY=your_movie_api_key
PORT=5000
```

---

### 4. Run the project

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm run dev
```

---

## 📌 Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
npm run dev
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | /api/movies          | Get movie list      |
| GET    | /api/recommendations | Get recommendations |
| POST   | /api/favorites       | Save favorite movie |

---

## 🛠️ Features

* 🎬 Browse movies
* 🔍 Search functionality
* ❤️ Save favorites
* ⚡ Fast and responsive UI
* 🔗 Integration with external APIs
* 💾 Persistent storage with MongoDB

---

## 📊 Project Goals

* Build a distributed system with real communication
* Implement scalable backend architecture
* Integrate third-party APIs
* Deploy a production-ready application

---

## 🔮 Future Improvements

* 🔐 User authentication (JWT)
* 📊 Advanced recommendations system
* ⚡ Caching layer (Redis)
* 📱 Mobile responsiveness improvements
* 🌙 Dark mode

---

## 📎 Repository

👉 https://github.com/raymundoht/movie-love

---

## 👨‍💻 Author

Developed by **Raymundo Hernández**

---
