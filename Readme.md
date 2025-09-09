# Artisan Service App – Backend

This is the backend for an app where **customers** can hire **artisans** for services. It handles signups, logins, job requests, and admin controls.


## Features

- Customer & Artisan Sign Up / Login
- JWT-based authentication
- View artisan profiles by skill & location
- Customers request jobs
- Artisans accept or reject jobs
- Admin approves artisan accounts
- SMS notifications (optional with Twilio)


##  Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt (password hashing)
- dotenv for config


## API Routes

### Users
- `POST /api/users/signup` → Register customer or artisan
- `POST /api/users/login` → Login and get token
- `GET /api/users/profile` → View own profile (token required)

### Artisans
- `GET /api/artisans?skill=Plumber&location=Accra` → Search artisans

### Jobs
- `POST /api/jobs` → Customer creates job
- `PATCH /api/jobs/:id` → Artisan updates job status

### Admin
- `PATCH /api/admin/approve/:id` → Approve artisan
- `GET /api/admin/users` → List all users
- `GET /api/admin/jobs` → List all jobs



## 📄 .env Setup (this file is not included but will be sent later)

env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


### Authentication

- JWT token is created on **login**
- Token must be sent in headers:



## To be able to execute this 
- git clone the repo
- npm install -> to install dependences 
- npm run dev -> to run the server 