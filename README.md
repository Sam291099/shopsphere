# 🛍️ ShopSphere – Full-Stack E-Commerce Application

ShopSphere is a full-stack e-commerce application designed to provide a modern online shopping experience with secure authentication, product management, shopping cart functionality, and order management.

The project is built using **React, TypeScript, Spring Boot, Java, and PostgreSQL**, following a frontend-backend architecture with RESTful APIs.

It is also a hands-on full-stack development project demonstrating modern application development practices, backend security, database integration, and frontend-backend communication.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Project Purpose](#-project-purpose)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#-application-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure PostgreSQL](#2-configure-postgresql)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Run the Backend](#4-run-the-backend)
  - [5. Run the Frontend](#5-run-the-frontend)
- [API Endpoints](#-api-endpoints)
- [Authentication and Authorization](#-authentication-and-authorization)
- [Build Commands](#-build-commands)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Overview

ShopSphere provides an online shopping platform where customers can browse products, add items to their shopping cart, and place orders.

Administrators can manage products and monitor customer orders through an administrative dashboard.

The application separates frontend and backend responsibilities:

- **Frontend:** Handles the user interface and customer interactions.
- **Backend:** Provides REST APIs, business logic, authentication, and authorization.
- **Database:** Stores users, products, and orders.

---

## 🎯 Project Purpose

The primary objectives of ShopSphere are:

1. Develop a complete full-stack e-commerce application.
2. Implement RESTful APIs using Spring Boot.
3. Build a responsive frontend using React and TypeScript.
4. Integrate PostgreSQL for persistent data storage.
5. Implement JWT-based authentication and role-based authorization.
6. Apply secure password storage using BCrypt.
7. Understand frontend-backend integration using Axios.
8. Practice application development, debugging, deployment preparation, and Git version control.

---

## ✨ Features

### Customer Features

- Browse available products.
- Search and filter products.
- Add products to the shopping cart.
- Increase or decrease cart quantities.
- Maintain cart data using browser local storage.
- Register a customer account.
- Log in using email and password.
- Authenticate API requests using JWT.

### Administrator Features

- Administrator authentication.
- Role-based access control.
- Admin dashboard.
- View customer orders.
- Search and filter orders.
- View individual order details.
- Update order statuses.
- Access protected administrative endpoints.

### Backend Features

- RESTful API architecture.
- Product CRUD operations.
- Order creation and management.
- PostgreSQL database integration.
- JPA/Hibernate ORM.
- BCrypt password encryption.
- JWT token generation and validation.
- Spring Security authorization.
- Global exception handling.
- Input validation.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Frontend | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Spring Boot |
| Backend Language | Java 25 |
| Build Tool | Apache Maven |
| Security | Spring Security |
| Authentication | JWT |
| Password Encryption | BCrypt |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 17 |
| Version Control | Git |
| Repository Hosting | GitHub |

### Main Development Versions

The project was developed and tested with:

- Java 25
- Apache Maven 3.10.0
- Spring Boot 4.1.2
- PostgreSQL 17
- Node.js 26 LTS
- npm
- React
- TypeScript
- Vite

For reproducible development, use the versions recorded in the project's Maven and npm configuration files.

---

## 🏗️ Application Architecture

ShopSphere follows a frontend-backend architecture.

```text
                 SHOPSPHERE APPLICATION

              ┌─────────────────────────┐
              │       React UI          │
              │    TypeScript + Vite    │
              │                         │
              │  Customer / Admin UI    │
              └────────────┬────────────┘
                           │
                           │ HTTP / REST API
                           │ JSON + JWT
                           ▼
              ┌─────────────────────────┐
              │      Spring Boot        │
              │                         │
              │   REST Controllers      │
              │   Business Services     │
              │   Spring Security       │
              │   JWT Authentication   │
              │   Spring Data JPA       │
              └────────────┬────────────┘
                           │
                           │ Hibernate / JDBC
                           ▼
              ┌─────────────────────────┐
              │      PostgreSQL         │
              │                         │
              │       Users             │
              │       Products          │
              │       Orders            │
              │       Order Items       │
              └─────────────────────────┘
```

### Application URLs

| Component | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Backend Health Check | http://localhost:8080/api/health |
| PostgreSQL | localhost:5432 |

---

## 📁 Project Structure

```text
shopsphere/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/shopsphere/
│   │       │
│   │       │   ├── config/
│   │       │   │   ├── SecurityConfig.java
│   │       │   │   └── PasswordConfig.java
│   │       │   │
│   │       │   ├── exception/
│   │       │   │
│   │       │   ├── health/
│   │       │   │
│   │       │   ├── product/
│   │       │   │   ├── controller/
│   │       │   │   ├── dto/
│   │       │   │   ├── entity/
│   │       │   │   ├── repository/
│   │       │   │   └── service/
│   │       │   │
│   │       │   ├── order/
│   │       │   │   ├── controller/
│   │       │   │   ├── dto/
│   │       │   │   ├── entity/
│   │       │   │   ├── repository/
│   │       │   │   └── service/
│   │       │   │
│   │       │   └── user/
│   │       │       ├── controller/
│   │       │       ├── dto/
│   │       │       ├── entity/
│   │       │       ├── repository/
│   │       │       └── service/
│   │       │
│   │       └── resources/
│   │           └── application.yml
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 📋 Prerequisites

Install the following software before running the application.

| Software | Required Version | Purpose |
|---|---|---|
| Java JDK | 25 | Run Spring Boot backend |
| Apache Maven | 3.10.0 | Backend build management |
| Node.js | 26 LTS | Run React frontend |
| npm | Included with Node.js | Frontend dependencies |
| PostgreSQL | 17 | Database |
| Git | Latest stable | Source control |
| VS Code | Recommended | Development IDE |

Verify the installations:

### Windows PowerShell

```powershell
java -version
mvn -version
node -v
npm -v
psql --version
git --version
```

### Linux Ubuntu

```bash
java -version
mvn -version
node -v
npm -v
psql --version
git --version
```

---

# 🚀 Installation and Setup

## 1. Clone the Repository

Clone the GitHub repository:

```bash
git clone https://github.com/Sam291099/shopsphere.git
```

Navigate into the project:

```bash
cd shopsphere
```

The project contains separate frontend and backend directories.

---

## 2. Configure PostgreSQL

Install and start PostgreSQL 17.

Create a database user and database.

Open the PostgreSQL terminal:

```bash
psql -U postgres
```

Execute:

```sql
CREATE USER shopsphere_user WITH PASSWORD 'YOUR_DATABASE_PASSWORD';

CREATE DATABASE shopsphere OWNER shopsphere_user;
```

Exit PostgreSQL:

```sql
\q
```

Test the connection:

```bash
psql -U shopsphere_user -d shopsphere -h localhost
```

Replace `YOUR_DATABASE_PASSWORD` with a password of your choice.

**Important:** Never commit your actual database password to GitHub.

---

## 3. Configure Environment Variables

The backend requires two environment variables:

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | PostgreSQL database password |
| `JWT_SECRET` | Secret key used for JWT signing |

The JWT secret should contain at least 32 bytes. Use a unique, randomly generated secret for each environment.

### Windows PowerShell

Set persistent user environment variables:

```powershell
[Environment]::SetEnvironmentVariable(
    "DB_PASSWORD",
    "YOUR_DATABASE_PASSWORD",
    "User"
)
```

Generate a random JWT secret:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
$rng.Dispose()

[Environment]::SetEnvironmentVariable(
    "JWT_SECRET",
    $secret,
    "User"
)
```

Close and reopen PowerShell or VS Code after setting the variables.

Verify that the variables are available without displaying their values:

```powershell
Write-Output "DB_PASSWORD set: $([bool]$env:DB_PASSWORD)"
Write-Output "JWT_SECRET set: $([bool]$env:JWT_SECRET)"
```

### Linux Ubuntu

Set the variables for the current terminal session:

```bash
export DB_PASSWORD='YOUR_DATABASE_PASSWORD'
```

Generate a random JWT secret:

```bash
export JWT_SECRET=$(openssl rand -base64 48)
```

Verify:

```bash
test -n "$DB_PASSWORD" && echo "DB_PASSWORD is set"
test -n "$JWT_SECRET" && echo "JWT_SECRET is set"
```

To persist them across terminal sessions, add suitable exports to your shell profile, such as `~/.bashrc`, then reload it:

```bash
source ~/.bashrc
```

Do not commit these values to the repository.

---

## 4. Run the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Build the application:

```bash
mvn clean install
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will start at:

```text
http://localhost:8080
```

Verify the health endpoint:

```text
http://localhost:8080/api/health
```

Expected response:

```json
{
  "application": "ShopSphere",
  "message": "Backend is running successfully!",
  "status": "UP"
}
```

Keep this terminal running.

### Windows and Linux

The Maven commands are identical on both operating systems.

---

## 5. Run the Frontend

Open a second terminal.

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

Open the URL in your browser.

The frontend uses the Vite development proxy to forward `/api` requests to the backend at `http://127.0.0.1:8080`.

Keep both frontend and backend terminals running during development.

---

## 🔌 API Endpoints

The backend exposes RESTful APIs.

### Health API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |

### Authentication API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new customer | Public |
| POST | `/api/auth/login` | Authenticate a user and generate JWT | Public |

### Product API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/products` | Retrieve products | Public |
| GET | `/api/products/{id}` | Retrieve product by ID | Public |
| POST | `/api/products` | Create a product | ADMIN |
| PUT | `/api/products/{id}` | Update a product | ADMIN |
| DELETE | `/api/products/{id}` | Delete a product | ADMIN |

### Order API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Create an order | ADMIN under current security configuration |
| GET | `/api/orders` | Retrieve all orders | ADMIN |
| GET | `/api/orders/{orderNumber}` | Retrieve an order | ADMIN |
| PUT | `/api/orders/{orderNumber}/status` | Update order status | ADMIN |

**Note:** Access requirements reflect the current backend security configuration. Order checkout authorization is an area for future refinement.

---

## 🔐 Authentication and Authorization

ShopSphere uses JWT-based authentication with Spring Security.

### Registration

Customers can create accounts using:

- Full name
- Email address
- Password

Passwords are encrypted using BCrypt before being stored in PostgreSQL.

Public registration assigns the `CUSTOMER` role by default.

### Login

After successful authentication, the backend generates a JWT token.

The token contains:

- User email as the subject.
- User role as a claim.
- Token issue time.
- Token expiration time.

### Authorization

ShopSphere currently supports two roles:

| Role | Permissions |
|---|---|
| CUSTOMER | Customer-level access and public product browsing |
| ADMIN | Product management and administrative order management |

Protected API requests use the following HTTP header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The frontend attaches the token automatically through an Axios request interceptor.

**Security note:** The frontend currently stores JWTs in browser local storage for development. Production deployments should consider secure HttpOnly cookies and appropriate CSRF protections.

---

## 🧱 Build Commands

### Backend

Build:

```bash
cd backend
mvn clean package
```

Compile only:

```bash
mvn clean compile
```

Run:

```bash
mvn spring-boot:run
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 🐛 Troubleshooting

### 1. Java command not found

Verify that Java is installed:

```bash
java -version
```

Configure `JAVA_HOME` and add the Java `bin` directory to `PATH`.

### 2. Maven command not found

Verify Maven:

```bash
mvn -version
```

Configure Maven's `bin` directory in the system `PATH`.

### 3. Database connection failed

Verify:

- PostgreSQL service is running.
- Database `shopsphere` exists.
- User `shopsphere_user` exists.
- `DB_PASSWORD` is correctly configured.
- PostgreSQL is listening on port `5432`.

### 4. JWT secret configuration error

Verify that `JWT_SECRET` is set in the terminal running Spring Boot.

The secret must contain at least 32 bytes.

### 5. CORS error

Ensure the frontend origin is included in the backend `SecurityConfig.java` CORS allowed origins.

The default local development origin is:

```text
http://localhost:5173
```

If accessing the frontend through a local network IP, that origin must also be allowed.

### 6. Port already in use

Default ports:

- Frontend: `5173`
- Backend: `8080`
- PostgreSQL: `5432`

Identify the process using a port and stop it if appropriate.

Windows:

```powershell
netstat -ano | findstr :8080
```

Linux:

```bash
sudo lsof -i :8080
```

### 7. Frontend API requests fail

Verify that:

- The Spring Boot backend is running.
- The frontend Vite server is running.
- The Vite proxy targets `http://127.0.0.1:8080`.
- The backend CORS configuration allows the frontend origin.

---

## 🚧 Future Enhancements

Planned improvements for ShopSphere include:

- Centralized React authentication context.
- Improved session and logout management.
- Automatic handling of expired JWT tokens.
- Customer order history.
- Customer-specific order authorization.
- Enhanced product administration.
- Product categories and image uploads.
- Pagination and sorting.
- Payment gateway integration.
- Shipping and delivery tracking.
- Automated backend and frontend testing.
- Docker containerization.
- Cloud deployment and CI/CD pipeline.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the application.
5. Submit a pull request.

Example:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

## 📄 License

No license has currently been specified for this project.

A license can be added to define how others may use, modify, and distribute the source code.

---

## 👨‍💻 Project Repository

**GitHub:** https://github.com/Sam291099/shopsphere

**Project:** ShopSphere – Full-Stack E-Commerce Application

Built with React, TypeScript, Spring Boot, Java, and PostgreSQL.

---

⭐ If you find this project interesting, consider starring the repository!
