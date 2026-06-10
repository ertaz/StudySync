# StudySync

## About the Project

StudySync is a smart learning platform developed as part of our **Lab Course 2** project. The idea behind this project is to create a modern university e-learning system inspired by Moodle, while adding extra features that improve communication, course management, and the overall learning experience.

Our goal is to provide a centralized platform where students, professors, and administrators can interact efficiently. Students can access learning materials, submit assignments, communicate with professors, and stay updated with course activities. Professors can manage lessons, sections , assignments, and announcements, while administrators oversee the entire platform while also managing  professors, categories, contact us messages, report generations gets feedbacks for courses.

---

## Technologies Used

### Frontend

* React + Vite
* TypeScript (.tsx)
* Tailwind CSS
* TailAdmin Template

### Backend

* Node.js
* Express.js
* Sequelize ORM
* MySQL

### Other Libraries and Tools

* JWT Authentication
* bcryptjs
* Socket.io
* Multer
* Express Validator
* dotenv
* CORS
* UUID

---

## Main Features

### User Authentication

* Login and Registration
* JWT Authentication
* Password Hashing with bcrypt
* Role-Based Access Control (Admin, Professor, Student)
* Refresh Tokens

### Course Management

* Create and manage courses
* Organize courses into categories
* Student enrollments
* Course FAQs
* Course announcements

### Learning Materials

* Create lessons
* Organize lessons into sections
* Upload documents and PDFs
* Course notes

### Assignment Management

* Create assignments
* Submit assignments
* Track submissions
* Provide feedback

### Communication

* Live Chat
* Announcements
* Contact Us page
* Feedback system

### Search and Reporting

* Advanced Search
* Dynamic Reports
* Import and Export functionality

### Security

* Input validation
* SQL injection protection
* Secure environment variables
* Audit logs for important actions

---

## Project Structure

### Backend

```bash
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   │   ├── sql/
│   │   └── nosql/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── sockets/
│   └── server.js
│
├── uploads/
└── package.json
```

### Frontend

```bash
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── assets/
│   └── services/
│
└── package.json
```

**Note:** The frontend is built using React with TypeScript (.tsx files), while the backend is developed using JavaScript (.js files).

---

## Installation

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file and configure the required environment variables.

4. Start the development server:

```bash
npm run dev
```

---

### Frontend Setup

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the frontend:

```bash
npm run dev
```

---

## Team Contributions

### Ardita

* Assignments
* Submissions
* Dynamic Reports
* Import & Export

### Nekibe

* Sections
* Notes
* AuditLogs

### Shukrije

* Lessons
* Feedbacks
* Advanced Search

### Vesa

* Announcements
* Contact Us
* Advanced Search

### Erta

* User Authentication
* User Management
* Enrollments
* Course FAQs
* Notifications

### Erjona

* Courses & Categories
* Live Chat
* Notifications

---

## Future Improvements

Some features that could be added in future versions include:

* Online quizzes and exams
* Video conferencing integration
* Mobile application
* AI-powered recommendations
* Calendar and scheduling system
* Email and push notifications

---

## Conclusion

StudySync is our attempt to create a modern and practical learning management system that can support everyday university activities. Through this project, we are applying full-stack development concepts, database management, authentication and authorization, real-time communication, and software engineering principles using the MERN stack and MySQL.

This project was developed for educational purposes as part of the Lab Course 2 curriculum.
