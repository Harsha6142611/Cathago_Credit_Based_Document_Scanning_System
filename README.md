# Cathago_Credit_Based_Document_Scanning_System

## Overview
The Document Scanning System is a credit-based application that allows users to scan and match documents. It features user authentication, document uploads, and an admin dashboard for managing users and credit requests.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Cloning the Repository](#cloning-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Environment Variables](#environment-variables)
- [License](#license)
- [Features](#features)
  - [Credit System](#credit-system)
  - [Document Scanning](#document-scanning)
  - [Result Display](#result-display)
  - [User Scan History](#user-scan-history)
  - [Admin Dashboard](#admin-dashboard)
- [Related Functions](#related-functions)
  - [Backend Functions](#backend-functions)
  - [Frontend Functions](#frontend-functions)
- [Tech Stack](#tech-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Other Tools](#other-tools)
- [Getting Started](#getting-started)
- [Contribution Guidelines](#contribution-guidelines)
- [Contact](#contact)

## Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)
- SQLite (for the database)

## Setup Instructions

### Cloning the Repository
1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run the following command to clone the repository:
   ```bash
   git clone https://github.com/Harsha6142611/Cathago_Credit_Based_Document_Scanning_System.git
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the required dependencies (if any):
   ```bash
   npm install
   ```

## Running the Application

### Running the Backend
1. Navigate back to the backend directory:
   ```bash
   cd backend
   ```
2. Start the backend server using:
   ```bash
   npm run dev
   ```
3. The backend server will run on `http://localhost:3000`.

### Running the Frontend
1. Open the frontend directory in Visual Studio Code:
   ```bash
   cd ../frontend
   code .
   ```
2. Install the Live Server extension for Visual Studio Code if you haven't already.
3. Open the `index.html` file in the frontend directory.
4. Right-click on the `index.html` file and select "Open with Live Server".
5. The frontend will be accessible at `http://localhost:5500` (or another port if specified).

## Environment Variables
- Ensure you have the following environment variables set up:
  - `DB_CONNECTION_STRING`: Connection string for the SQLite database.
  - `JWT_SECRET`: Secret key for JWT authentication.
  - `PORT`: Port number for the backend server.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Features

### Credit System
- **User Credits**: Each user is allocated a certain number of credits which are required to perform document scans.
- **Requesting Credits**: Users can request additional credits through the application interface. These requests are sent to the admin for approval.

### Document Scanning
- **File Upload**: Users can upload documents to be scanned. The system supports various file formats.
- **Scanning Process**: Once a document is uploaded, the system processes the file to extract and match relevant information.

### Result Display
- **Scan Results**: After processing, the results are displayed to the user in a user-friendly format, highlighting key matches and extracted data.

### User Scan History
- **History Tracking**: Users can view their past scans and results. This feature helps in keeping track of document processing activities.

### Admin Dashboard
- **Credit Request Approval**: Admins can view and approve or reject credit requests from users.
- **User Monitoring**: Admins have access to user activity logs, allowing them to monitor document scans and credit usage.
- **User Management**: Admins can manage user accounts, including creating, updating, and deleting users.

## Related Functions

### Backend Functions
- **Authentication**: Handles user login and registration, ensuring secure access to the system.
- **Credit Management**: Manages user credits, including deduction for scans and processing credit requests.
- **Document Processing**: Core logic for scanning and matching documents.

### Frontend Functions
- **User Interface**: Provides a responsive interface for users to interact with the system, including uploading files and viewing results.
- **Admin Interface**: Offers tools for admins to manage users and credit requests efficiently.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime for building the backend server.
- **Express.js**: Web framework for Node.js to handle routing and middleware.
- **SQLite**: Lightweight database for storing user data, credits, and scan history.

### Frontend
- **HTML/CSS/JavaScript**: Core technologies for building the user interface.
- **Visual Studio Code**: Recommended IDE for development with Live Server extension for running the frontend.

### Other Tools
- **Git**: Version control system for managing codebase.
- **npm**: Node Package Manager for managing project dependencies.

## Getting Started
To get started with the application, follow the setup instructions to clone the repository, set up the backend and frontend, and run the application locally.

## Contribution Guidelines
We welcome contributions! Please fork the repository and submit a pull request for any changes. Ensure your code follows the project's coding standards and includes appropriate tests.

## Contact
For questions or support, please contact [your-email@example.com].



