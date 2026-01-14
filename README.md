# 🚀 GigFlow – Mini Freelance Marketplace Platform

**Author:** Deeksha Nayak
**Tech Stack:** React.js • Node.js • Express.js • MongoDB • JWT • Tailwind CSS

---

## 📌 Project Overview

**GigFlow** is a mini freelance marketplace platform where users can act as both **Clients** and **Freelancers**.
Clients can post jobs (Gigs), and Freelancers can place bids on those gigs. The platform focuses on secure authentication, clean API architecture, proper database relationships, and real-world hiring logic.

This project was built as part of a **Full Stack Development Assignment**, emphasizing backend logic, state management, and transactional integrity.

**Estimated Development Time:** 2–3 Days
**Submission Includes:** GitHub Repository + Hosted Application Link

---

## 🎯 Key Objectives

* Implement a **secure authentication system** using JWT and HttpOnly cookies.
* Design **clean REST APIs** with proper role-based access.
* Handle **complex gig-bid-hire logic** correctly.
* Ensure **data consistency** during concurrent operations.
* Build a **scalable full-stack architecture**.

---

## 🛠️ Technical Stack

### Frontend

* **React.js** (Vite)
* **Tailwind CSS**
* **Redux Toolkit / Context API** (State Management)

### Backend

* **Node.js**
* **Express.js**

### Database

* **MongoDB**
* **Mongoose**

### Authentication & Security

* **JWT (JSON Web Tokens)**
* **HttpOnly Cookies**

### Bonus Integrations

* **MongoDB Transactions**
* **Socket.io** (Real-time updates)

---

## 🔐 Core Features

### A. User Authentication

* Secure **Sign-up & Login**
* Password hashing
* JWT-based authentication using **HttpOnly cookies**
* Role-free system: Any user can be a **Client** or **Freelancer**

---

### B. Gig Management (CRUD)

* **Browse Gigs:** View all open job postings
* **Search & Filter:** Search gigs by title
* **Post a Job:** Logged-in users can create gigs with:

  * Title
  * Description
  * Budget
* **Gig Status:**

  * `open` → Available for bidding
  * `assigned` → Freelancer hired

---

### C. Bidding & Hiring Logic (Critical Feature)

#### 1. Bidding

* Freelancers can submit bids with:

  * Message
  * Bid amount
* Each bid is linked to a specific gig

#### 2. Review Bids

* Only the **Gig Owner (Client)** can view all bids on their gig

#### 3. Hiring Process

When a client hires a freelancer:

* ✅ Gig status changes from `open` → `assigned`
* ✅ Selected bid status becomes `hired`
* ❌ All other bids for that gig are automatically marked `rejected`
* ❌ Further hiring attempts are blocked

This ensures **only one freelancer** can be hired per gig.

---

## 🔄 API Architecture

| Category | Method | Endpoint                | Description                            |
| -------- | ------ | ----------------------- | -------------------------------------- |
| Auth     | POST   | `/api/auth/register`    | Register new user                      |
| Auth     | POST   | `/api/auth/login`       | Login & set HttpOnly cookie            |
| Gigs     | GET    | `/api/gigs`             | Fetch all open gigs (search supported) |
| Gigs     | POST   | `/api/gigs`             | Create a new gig                       |
| Bids     | POST   | `/api/bids`             | Submit a bid for a gig                 |
| Bids     | GET    | `/api/bids/:gigId`      | Get all bids for a gig (Owner only)    |
| Hiring   | PATCH  | `/api/bids/:bidId/hire` | Hire a freelancer (atomic logic)       |

---

## 🧱 Database Schema Design

### User

```js
{
  name: String,
  email: String,
  password: String
}
```

### Gig

```js
{
  title: String,
  description: String,
  budget: Number,
  ownerId: ObjectId,
  status: "open" | "assigned"
}
```

### Bid

```js
{
  gigId: ObjectId,
  freelancerId: ObjectId,
  message: String,
  status: "pending" | "hired" | "rejected"
}
```

---

## ⭐ Bonus Implementations

### Bonus 1: Transactional Integrity (Race Condition Handling)

* The **Hire Freelancer** operation is implemented using **MongoDB Transactions**
* Ensures:

  * If multiple users attempt to hire at the same time
  * Only **one hire operation succeeds**
  * Data remains consistent and reliable

---

### Bonus 2: Real-time Notifications (Socket.io)

* Integrated **Socket.io**
* When a freelancer is hired:

  * They receive an instant real-time notification:

    > *"You have been hired for [Project Name]!"*
* No page refresh required

---

## 🧪 Security & Best Practices

* JWT stored in **HttpOnly cookies**
* Protected routes using middleware
* Role-based access validation
* Clean and modular code structure
* Scalable REST API design

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gigflow.git
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables

Create a `.env` file with:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 📌 Conclusion

GigFlow demonstrates real-world freelance marketplace functionality with a strong focus on **backend logic, data integrity, and secure authentication**. The project is designed to be scalable, maintainable, and production-ready.

---

### 👩‍💻 Developed By

**Deeksha Nayak**