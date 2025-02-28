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
4. Navigate into the cloned directory:
   ```bash
   cd document-scanning-system
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
Create a `.env` file in the `backend` directory and add the following variables:
