# 🤖 AI Tool Finder

A full-stack platform to discover, review, and manage AI tools with automated ratings and admin moderation.

---

## 📌 Problem Statement

With the rapid growth of AI tools, users need a reliable platform to discover, evaluate, and compare tools based on functionality, pricing, and quality.  
The **AI Tool Finder** platform allows:

- Users to browse and filter AI tools
- Users to submit reviews
- Automatic rating calculation
- Admin moderation and tool management

---

## 🖥️ Frontend (Vite + Vanilla JavaScript)

A fast Single Page Application (SPA) with dynamic content updates.

### 🔧 Tech Stack
- **Vite** – Fast development & optimized builds  
- **Vanilla JavaScript** – Core logic & UI interactions  
- **CSS3** – Styling with Light/Dark theme  
- **Fetch API** – Backend communication  

### ✨ Key Features
- Dynamic view management (no page reloads)
- Instant UI updates after admin actions
- Tool Name Resolver with caching (JavaScript Map)
- Light/Dark theme with localStorage persistence

---

## ⚙️ Backend (Spring Boot + MongoDB)

Handles business logic, security, and data persistence.

### 🔐 Core Backend Features
- **Rating Engine** – Auto-recalculates tool ratings on review approval
- **Admin Security** – Header-based authentication using `X-ADMIN-KEY`
- **MongoDB** – Flexible schema & fast queries
- **Global Exception Handling**
- **Swagger / OpenAPI Documentation**

---

## 🛠️ Setup & Installation

### ✅ Prerequisites
- Java 21
- Node.js & npm
- MongoDB (running on port `27017`)

---

### ▶️ Run Backend
```bash
./mvnw spring-boot:run
```
Backend URL:  
`http://localhost:8080`

---

### ▶️ Run Frontend
```bash
npm install
npm run dev
```
Frontend URL:  
`http://localhost:5173`

---


## 🔗 GitHub Repositories

- **Frontend**: https://github.com/AkshayShineKrishna/AI-TOOL-FINDER  
- **Backend**: https://github.com/AkshayShineKrishna/AI-TOOL-FINDER  

---
