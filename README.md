# Personal Finance Manager

A comprehensive, full-stack personal finance management application designed to help users track their income, expenses, budgets, and investments. The platform features a modern, responsive user interface with glassmorphism design elements and a robust, scalable backend architecture.

## 🚀 Features

- **User Authentication & Profiles:** Secure JWT-based authentication, user registration, profile management, and avatar image uploads.
- **Transaction Tracking:** Easily add, edit, and categorize income and expenses. Filter and search through transaction history.
- **Budget Management:** Set monthly budgets for different categories and track your spending progress in real-time.
- **Financial Reports & Analytics:** Visualize your financial health with interactive charts, monthly summaries, and spending trend graphs.
- **Live Market Rates:** Real-time integration with external APIs to display current gold prices and foreign exchange rates (USD, EUR, GBP to TRY).
- **Export Data:** Download your financial reports in PDF or Excel formats.

## 📸 Screenshots

-**You can find the latest screenshots and visual demonstrations of the application interface inside the assets/ folder.

## 🛠️ Technology Stack

### Backend
- **Java 21 & Spring Boot 3:** Robust and scalable core framework.
- **Spring Security:** Stateless JWT authentication and authorization.
- **Spring Data JPA & Hibernate:** ORM for database operations.
- **PostgreSQL:** Primary relational database.
- **Redis:** High-performance caching layer for market rates and reporting.
- **Flyway:** Database migration and version control.

### Frontend
- **React & TypeScript:** Modern, type-safe UI development.
- **Vite:** Blazing fast build tool and development server.
- **Recharts:** Dynamic and interactive data visualizations.
- **Axios:** API request handling with automated token refreshing.
- **React Datepicker & date-fns:** User-friendly date and month selection.

### Infrastructure
- **Docker & Docker Compose:** Containerized environment for seamless deployment.
- **Nginx:** High-performance web server and reverse proxy for the frontend.

## ⚙️ Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Java 21 & Maven (for local backend development)

### Running with Docker (Recommended)

The easiest way to run the entire stack (PostgreSQL, Redis, Backend API, Frontend/Nginx) is via Docker Compose:

1. Clone the repository:
   ```bash
   git clone https://github.com/rumeysacipil/personel-finance.git
   cd personel-finance
   ```

2. Start the containers:
   ```bash
   docker-compose up -d --build
   ```

3. Access the application at `http://localhost:3000`.

### Running Locally (Development Mode)

If you prefer to run the services separately for development:

**1. Database Services**
Ensure you have a PostgreSQL database named `finance` and a Redis instance running locally.

**2. Backend**
```bash
cd backend
mvn spring-boot:run
```
The backend API will start on `http://localhost:8081`.

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:5173`.

## 📁 Project Structure

- `/backend`: Spring Boot REST API and configuration.
- `/frontend`: React application and Nginx server configuration.
- `docker-compose.yml`: Multi-container orchestration.


