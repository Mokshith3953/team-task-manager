# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Features

- User authentication (Signup/Login)
- Project creation and management
- Task assignment and status tracking
- Dashboard with task overview and overdue alerts
- Role-based access (Admin/Member)

## Tech Stack

- Backend: Node.js, Express.js, MongoDB, JWT
- Frontend: React, Axios
- Deployment: Railway

## Installation

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Deployment

This app is configured for deployment on Railway.

1. Connect your GitHub repository to Railway.
2. Set environment variables in Railway dashboard.
3. Deploy the app.

## Usage

1. Signup as an Admin or Member.
2. Login to access the dashboard.
3. Create projects and assign team members.
4. Add tasks to projects and track their status.

## API Endpoints

- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- GET /api/projects - Get user's projects
- POST /api/projects - Create a new project
- GET /api/tasks/project/:projectId - Get tasks for a project
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task

## License

MIT