# API Documentation

> **IMPORTANT**: All date/time values are expected to be in the format `"YYYY-MM-DD HH:MM"` (e.g., the string "2025-05-05 12:00"). Dates should be in `YYYY-MM-DD` format and times in 24-hour `HH:MM` format.

## Introduction

This document provides an overview of the API endpoints for the Sports Facility Scheduler backend. Endpoints are divided into namespaces for user management and reservation management. Many endpoints require JWT-based authentication. Include the header:

```
Authorization: Bearer <token>
```

## User Endpoints (/user)

### 1. Register a New User

- **Endpoint:** POST /user/register
- **Description:** Registers a new user. It creates a user record with a hashed password. Non-admins use the default member type based on the provided organization ID (`org_id`), while admins can override this using the `member_type_id` field.
- **Request Body:**
  - firstName: string
  - lastName: string
  - address: string
  - birthdate: string (in ISO date format)
  - maxCourtsPerDay: number (only admins can override this field)
  - email: string
  - password: string
  - org_id: number/string
  - member_type_id: number (optional; admin only override)
- **Response:**
  - On success: HTTP 201 with JSON containing the created user (password is omitted).
  - On failure: Appropriate error message (e.g. 400 or 500 status code).

### 2. Login a User

- **Endpoint:** POST /user/login
- **Description:** Authenticates a user by verifying their email and password. Returns a JWT token upon successful login.
- **Request Body:**
  - email: string
  - password: string
- **Response:**
  - On success: HTTP 200 with JSON containing the token.
  - On failure: HTTP 401 or other error status with an error message.

### 3. Get User Profile

- **Endpoint:** GET /user/profile
- **Description:** Retrieves the profile of the authenticated user.
- **Authentication:** Requires a valid JWT token.
- **Response:**
  - On success: JSON containing user details.

### 4. Update User Information

- **Endpoint:** PUT /user/:id
- **Description:** Updates user information. Non-admin users can only update their own profile fields, while admin users have the additional ability to modify `member_type_id` and `maxCourtsPerDay`.
- **URL Parameter:**
  - id: The user's ID to update.
- **Request Body:**
  - For all users:
    - firstName (optional)
    - lastName (optional)
    - address (optional)
    - birthdate (optional)
    - email (optional)
  - Admin-only fields (optional):
    - member_type_id, maxCourtsPerDay
- **Response:**
  - On success: JSON with updated user information.
  - On failure: Appropriate error (e.g. 403 if unauthorized, 404 if user not found).

## Reservation Endpoints (/reservation)

### 1. Get Reservations

- **Endpoint:** GET /reservation
- **Description:** Retrieves reservations with optional filtering. For non-admin users, only their own reservations are returned. Admin users can filter by `personId` to view reservations by other users.
- **Query Parameters (Optional):**
  - start: ISO date string (returns reservations with a start date after or equal to this value)
  - end: ISO date string (returns reservations with an end date before or equal to this value)
  - reason: string (search by reservation reason)
  - courtId: number/string (filter by court)
  - personId: number/string (admin only; filter reservations by a specific user)
  - status: string (filter by reservation status)
- **Response:**
  - On success: HTTP 200 with a JSON array of reservations.

### 2. Create Reservation

- **Endpoint:** POST /reservation
- **Description:** Creates a new reservation. Non-admin users automatically set the reservation status to "Pending", while admins can specify the status (defaulting to "Confirmed" if not provided) and can create reservations on behalf of others using the `personId` field.
- **Request Body:**
  - start: ISO date string (required)
  - end: ISO date string (required)
  - courtId: number/string (required)
  - reason: string (optional)
  - notes: string (optional)
  - personId: number (optional; admin only)
  - status: string (optional; admin only)
- **Response:**
  - On success: HTTP 201 with JSON containing a success message and the created reservation details.
  - On failure: HTTP 400 for missing required fields or other error messages.

### 3. Update Reservation

- **Endpoint:** PUT /reservation/:id
- **Description:** Updates an existing reservation. Non-admin users can only update their own reservations. Fields that may be updated include start time, end time, reason, notes, and court. Admin users can also update the reservation status and the user associated via `personId`.
- **URL Parameter:**
  - id: The reservation ID to update.
- **Request Body:**
  - start: ISO date string (optional)
  - end: ISO date string (optional)
  - reason: string (optional)
  - notes: string (optional)
  - courtId: number/string (optional)
  - personId: number (optional; admin only)
  - status: string (optional; admin only)
- **Response:**
  - On success: HTTP 200 with JSON containing a success message and the updated reservation details.
  - On failure: Appropriate error (e.g. 403 if unauthorized, 404 if reservation not found).

## Main Server Endpoints

The main server (defined in backend/server.js) includes some additional endpoints:

### 1. Test Authentication Endpoint

- **Endpoint:** GET /success
- **Description:** A protected test endpoint that confirms the user is authenticated. Returns a simple success message.
- **Authentication:** Requires a valid JWT token.

### 2. Login Information Endpoint

- **Endpoint:** GET /login
- **Description:** This endpoint provides information on how to log in. It instructs users to perform a POST on /user/login with their credentials.
