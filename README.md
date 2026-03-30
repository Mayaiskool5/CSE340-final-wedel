# CSE340 Final Project: Vehicle Dealership Web App

## Project Description
This is a full-featured vehicle dealership web application for managing vehicle inventory, service requests, user reviews, and administrative operations. The site supports multiple user roles (Owner, Employee, Customer) with role-based permissions, dynamic content management, and a multi-stage workflow for service requests and contact forms. Built with Node.js, Express, EJS, and PostgreSQL.

## Database Schema
- Multiple normalized tables: users, roles, vehicles, categories, reviews, service_requests, contact_messages, activity_logs, etc.
- Proper foreign keys, CASCADE/SET NULL, and data types.
- See `/src/models/sql/root.sql` for schema.
- **ERD:** ![ERD Image Here](./ERD.png)  <!-- Replace with your actual ERD image file -->

## User Roles
- **Owner (Admin):** Full control over users, vehicles, categories, reviews, logs, and all site content.
- **Employee:** Can manage service requests, moderate reviews, and view contact responses.
- **Customer:** Can browse vehicles, submit reviews, request services, and contact the dealership.

## Test Account Credentials
- Use the following emails to log in as each role (password for all: `Test1234!`):
  - Owner: `owner@example.com`
  - Employee: `employee@example.com`
  - Customer: `customer@example.com`

## Known Limitations
- [List any incomplete features or known bugs here.]
- Example: "No email notifications for service request updates."

## Features Checklist
- [x] Normalized relational database with foreign keys
- [x] Session-based authentication (express-session)
- [x] Password hashing (bcrypt)
- [x] Multiple user roles with permissions
- [x] Server-side rendering (EJS)
- [x] MVC architecture
- [x] Middleware for auth, validation, error handling
- [x] Dynamic content management
- [x] User-generated content (reviews, requests)
- [x] Multi-stage workflow (service requests, contact forms)
- [x] Admin dashboard for management
- [x] SQL injection prevention, validation, sanitization
- [x] Production-ready deployment (Render)

## Deployment
- Live site: https://cse340-final-wedel.onrender.com/
- PostgreSQL database connected in production
- Environment variables managed in `.env`

## Commit History
- Minimum 15 substantial commits required (see GitHub repo)

