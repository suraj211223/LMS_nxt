# API Documentation

This document outlines the key backend API endpoints used in the VL ProLab application.
*Base URL*: `/api`

## Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/login` | Authenticates a user. Returns a session cookie (`userId`) and user details. |

---

## Admin Resources
*Requires `Admin` Role privilege.*

### School Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/admin/schools/create` | Creates a new School. Request Body: `{ "schoolName": "..." }`. |
| **GET** | `/admin/schools` | Lists all schools (implied). |

### User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/admin/users` | Lists all users. |
| **POST** | `/admin/users` | Creates a new user (Teacher/Editor/Admin). |

---

## Teacher Resources
*Requires `Teacher` Role privilege.*

### Course Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/teacher/courses` | Lists courses assigned to the logged-in teacher. |
| **GET** | `/teacher/courses/[id]` | Details for a specific course. |

---

## Editor Resources
*Requires `Editor` Role privilege.*

### Content Workflow
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/editor/dashboard` | Lists assigned topics/content. |
| **POST** | `/download-topic-material`| Handles file downloads for specific topics. |

---

## Middleware & Security
*   **Global Middleware**: `middleware.js` ensures all routes (except `/login`) require a valid `userId` session cookie.
*   **RBAC**: Role Based Access Control is handled within specific page logic and API routes.
