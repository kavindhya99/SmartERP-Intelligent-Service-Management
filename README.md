# SmartERP – Intelligent Service Management System

**A full-stack service management application featuring intelligent technician recommendations, location-aware work order assignment, interactive GIS mapping and real-time dashboard updates.**

SmartERP demonstrates how modern web technologies, enterprise application architecture and rule-based decision-making can improve field service management workflows.

## Overview

SmartERP is a portfolio project designed to streamline technician management and maintenance work order processing.

The system allows service managers to register technicians, create maintenance work orders, identify suitable technicians using a weighted recommendation algorithm, and assign work orders based on skill compatibility, availability, workload and geographical distance.

An interactive GIS dashboard visualizes technician and work order locations, supporting more informed assignment decisions.

## Key Features

### Technician Management
- Create, view, update and delete technician records.
- Maintain technician contact details and technical skills.
- Track technician availability and current workload.
- Store geographical coordinates for location-aware assignments.
- Protect technicians associated with assigned work orders from deletion.

### Work Order Management
- Create, view, update and delete maintenance work orders.
- Capture descriptions, required skills, priorities and geographical locations.
- Track work orders through Pending and Assigned statuses.
- Restrict modifications to assigned work orders to preserve assignment consistency.

### Intelligent Technician Recommendation Engine
SmartERP includes a rule-based recommendation engine that evaluates eligible technicians using multiple weighted criteria:

| Criterion | Maximum Score |
|---|---:|
| Skill compatibility | 40 |
| Technician availability | 25 |
| Workload optimization | 20 |
| Geographical proximity | 15 |
| **Total** | **100** |

The recommendation process:

1. Identifies technicians matching the required skill.
2. Filters out unavailable technicians.
3. Calculates workload and proximity scores.
4. Estimates geographical distance using the Haversine formula.
5. Ranks eligible technicians by their overall score.
6. Allows service managers to assign a recommended technician.

This approach provides explainable recommendations without requiring a machine learning model.

### GIS Integration
- Interactive maps powered by Leaflet and OpenStreetMap.
- Technician and work order location markers.
- Color-coded map markers.
- Popups containing relevant technician and work order details.
- Zooming and map navigation.

### Dashboard and Analytics
- Total technician count.
- Total work order count.
- Pending work order count.
- Assigned work order count.
- Automatic dashboard refresh after successful create, update and assignment operations.

### Data Integrity
- Backend validation of required fields and geographical coordinates.
- Prevention of unauthorized workload changes through ordinary technician update operations.
- Restrictions on editing or deleting assigned work orders.
- Database transactions during technician assignment.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite, HTML5, CSS3 |
| Backend | C#, ASP.NET Core 10 Web API |
| Database | SQLite |
| ORM | Entity Framework Core 10 |
| GIS | React Leaflet, Leaflet, OpenStreetMap |
| HTTP Client | Axios |
| UI Icons | Lucide React |
| API Architecture | RESTful Web API |
| Development Tools | Visual Studio Code, .NET CLI, npm, Git, GitHub |

## System Architecture

```text
                   SMARTERP
                       |
                React Frontend
                       |
                Axios HTTP Client
                       |
                ASP.NET Core API
                       |
            -----------------------
            |                     |
    REST API Controllers   Recommendation Service
            |                     |
            -----------------------
                       |
                Entity Framework Core
                       |
                 SQLite Database

GIS Visualization:
React Leaflet + OpenStreetMap
```

### Architecture Components

**Frontend:** React components handle dashboard rendering, forms, technician management, work order management, smart recommendations and interactive GIS visualization.

**Backend:** ASP.NET Core controllers expose REST endpoints for technician and work order operations.

**Business Logic:** A dedicated technician assignment service calculates recommendation scores using skill compatibility, availability, workload and distance.

**Persistence:** Entity Framework Core provides database access, migrations and object-relational mapping for SQLite.

## REST API Endpoints

### Technician API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/technicians` | Retrieve technicians |
| GET | `/api/technicians/{id}` | Retrieve a technician |
| POST | `/api/technicians` | Create a technician |
| PUT | `/api/technicians/{id}` | Update a technician |
| DELETE | `/api/technicians/{id}` | Delete a technician |

### Work Order API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workorders` | Retrieve work orders |
| GET | `/api/workorders/{id}` | Retrieve a work order |
| POST | `/api/workorders` | Create a work order |
| PUT | `/api/workorders/{id}` | Update a work order |
| DELETE | `/api/workorders/{id}` | Delete a work order |
| GET | `/api/workorders/{id}/recommendations` | Retrieve ranked technician recommendations |
| POST | `/api/workorders/{id}/assign/{technicianId}` | Assign a technician |

## Project Structure

```text
SmartERP/
|
|-- SmartERP.API/
|   |-- Controllers/
|   |   |-- TechniciansController.cs
|   |   |-- WorkOrdersController.cs
|   |
|   |-- Data/
|   |   |-- AppDbContext.cs
|   |
|   |-- Models/
|   |   |-- Technician.cs
|   |   |-- WorkOrder.cs
|   |
|   |-- Services/
|   |   |-- TechnicianAssignmentService.cs
|   |
|   |-- Migrations/
|   |-- Program.cs
|   |-- appsettings.json
|
|-- smarterp-frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- CreateTechnician.jsx
|   |   |   |-- CreateWorkOrder.jsx
|   |   |   |-- ManageRecord.jsx
|   |   |   |-- SmartRecommendations.jsx
|   |   |   |-- ServiceMap.jsx
|   |   |
|   |   |-- services/
|   |   |   |-- api.js
|   |   |
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
|   |
|   |-- package.json
|
|-- .gitignore
|-- README.md
```

## Installation and Setup

### Prerequisites

Ensure the following are installed:

- .NET SDK 10
- Node.js and npm
- Git
- Visual Studio Code or another compatible development environment

### 1. Clone the Repository

```bash
git clone https://github.com/kavindhya99/SmartERP-Intelligent-Service-Management.git
cd SmartERP-Intelligent-Service-Management
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd SmartERP.API
```

Ensure the SQLite connection string in `appsettings.json` is configured for local development:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=smarterp.db"
  }
}
```

Restore dependencies and apply database migrations:

```bash
dotnet restore
dotnet tool restore
dotnet ef database update
```

If `dotnet ef` is not available, install it using the appropriate .NET 10-compatible version:

```bash
dotnet tool install --global dotnet-ef --version 10.0.12
dotnet ef database update
```

Start the backend:

```bash
dotnet run --no-launch-profile --urls http://localhost:5000
```

The API will be accessible at:

`http://localhost:5000`

### 3. Configure the Frontend

Open another terminal and navigate to:

```bash
cd smarterp-frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open:

`http://localhost:5173`

Ensure both the frontend and backend servers are running.

## Example Workflow

1. Register technicians with their skills, availability and location coordinates.
2. Create a new maintenance work order.
3. Select the Smart Recommendation option.
4. Review eligible technicians ranked by their recommendation scores.
5. Assign the most suitable technician.
6. Observe the work order status changing to Assigned.
7. Verify that the assigned technician's workload has increased.
8. View technician and work order locations on the GIS map.

## Screenshots

Screenshots can be added to the `screenshots` directory.

### Dashboard

![SmartERP Dashboard](screenshots/dashboard.png)

### GIS Service Map

![GIS Service Map](screenshots/gis-map.png)

### Smart Technician Recommendations

![Smart Recommendations](screenshots/smart-recommendations.png)

### Work Order Management

![Work Order Management](screenshots/work-orders.png)

*Note: Add the corresponding image files before the screenshots will appear on GitHub.*

## Future Enhancements

- JWT authentication and role-based access control.
- Work order lifecycle management with completion and cancellation workflows.
- Technician capacity planning and advanced scheduling.
- Road-network travel time integration.
- Database-level concurrency protection.
- Unit and integration testing.
- Advanced reporting and analytics.
- Cloud deployment and CI/CD integration.

## Engineering Concepts Demonstrated

- Full-stack application development
- RESTful API design
- Object-oriented programming
- Separation of concerns
- Entity Framework Core and relational data persistence
- CRUD operations and data validation
- Rule-based recommendation algorithms
- Geospatial distance calculation
- Transaction-based business operations
- React component architecture and state management
- Enterprise service management workflows

## Author

**Chamodi Kavindhya De Silva**

Software Engineer | Full-Stack Development | Enterprise Applications | GIS Integration

GitHub: [kavindhya99](https://github.com/kavindhya99)

LinkedIn: [Chamodi Kavindhya](https://www.linkedin.com/in/chamodikavindhya/)

## Project Status

**Portfolio MVP — Functional**

Core technician management, work order management, smart recommendations, assignment and GIS visualization have been implemented. Additional production-level security, testing and deployment enhancements are planned.
