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
  - start: ISO date string (YYYY-MM-DD HH:MM; required)
  - end: ISO date string (YYYY-MM-DD HH:MM; required)
  - courtId: number/string (required)
  - reason: string (optional)
  - notes: string (optional)
  - personId: number (optional; admin only)
  - status: string (optional; admin only)
- **Response:**
  - On success: HTTP 201 with JSON containing a success message and the created reservation details. Default status is pending. Use /confirm method to change status to "confirmed" with payment.
  - On failure: HTTP 400 for missing required fields or other error messages.

### 3. Update Reservation

- **Endpoint:** PUT /reservation/:id
- **Description:** Updates an existing reservation. Non-admin users can only update their own reservations. Fields that may be updated include start time, end time, reason, notes, and court. Admin users can also update the reservation status and the user associated via `personId`.
- **Request Body:**
  - start: ISO date string (optional)
  - end: ISO date string (optional)
  - reason: string (optional)
  - notes: string (optional)
  - courtId: number/string (optional)
  - personId: number (optional; admin only)
  - status: string (optional; anyone can update their own reservation to "cancelled", admin can update to any status)
- **Response:**
  - On success: HTTP 200 with JSON containing a success message and the updated reservation details.
  - On failure: Appropriate error (e.g. 403 if unauthorized, 404 if reservation not found).

### 4. Confirm Payment for Reservation

- **Endpoint:** POST /reservation/confirm
- **Description:** Updates a reservation's status to "Confirmed" if the payment is valid. This endpoint doesn't confirm that payment was actually recieved, it just takes a dummy payment amount and updates the reservation status to confirmed.
- **Request Body:**
  - reservationId: ID of reservation (required)
  - paymentAmount: amount paid (required)
- **Response:**
  - On success: Returns the updated reservation with confirmation details.
  - On failure: Appropriate error (e.g. 403 if unauthorized, 404 if reservation not found).

## Court Endpoints (/court)

### 1. Get Courts

- **Endpoint:** GET /court
- **Description:** Retrieves courts with optional filtering. 
- **Query Parameters (Optional):**
  - name: string (filter by court name)
  - status: string (filter by court status, can only be "confirmed", "pending", or "cancelled")
  - court_type_id: number (search by court type)
  - page: page number (default 1)
  - limit: number (number of courts returned; default 10, max 50)
- **Response:**
  - On success: HTTP 200 with a JSON array of courts.

### 2. Get Available Courts

- **Endpoint:** GET /court/available
- **Description:** Find available courts with filters. This endpoint checks each court to see if there's a continuous block of availability equal to the requested duration (in minutes) on any day within the given date range. Candidate start times must lie on a quarter-hour boundary (xx:00, xx:15, xx:30, xx:45). If optional time_start and time_end are provided (in HH:MM 24hr format), then the available slot must also fall within that period.
- **Query Parameters:**
  - sport: string (maps to court_type name; required)
  - start_date: string (YYYY-MM-DD format; required)
  - end_date: string (required)
  - time: number (duration in mins, eg. 30, 60; optional)
  - time_start: number (HH:MM 24hr; optional)
  - time_end: number (optional)
  - lat: number (latitude for location filtering; optional)
  - lng: number (longitude for location filtering; optional)
  - radius: number (search radius in miles, default: 25; optional)
- **Response:**
  - On success: Array of available courts. Eg. 
  ```
  {
    "data": [
        {
            "id": 2,
            "court_name": "Court 2",
            "image": null,
            "latitude": 40.7128,
            "longitude": -74.006,
            "zip": "90210",
            "status": "available",
            "org_id": 1,
            "org_name": "Organization A"
        }
    ],
    "count": 1
  } 
  ```


### 3. Get a Specific Court

- **Endpoint:** GET /court/:id
- **Description:** Retrieves a single court by ID. 
- **Query Parameters:**
  - id: number/ string (required)
- **Response:**
  - On success: HTTP 200 with the requested court's court type and open hours.

### 4. Add New Court (Not Tested)

- **Endpoint:** POST /court
- **Description:** Adds new court to database. (not tested)
- **Query Parameters (required):**
  - name: string
  - status: string
  - court_type_id: number/ string
  - org_id: number/ string
  - latitude: number
  - longitude: number
- **Response:**
  - On success: HTTP 201 with JSON information about new court.

### 5. Update Court (Not tested)

- **Endpoint:** PUT /court/:id
- **Description:** Updates existing court. 
- **Query Parameters:**
  - name: string (required)
  - status: string (optional)
  - court_type_id: number/ string (optional)
  - org_id: number/ string (required)
  - latitude: number (optional)
  - longitude: number (optional)
- **Response:**
  - On success: HTTP 200 with updated court details.

### 6. Delete Court (Not tested)

- **Endpoint:** DELETE /court/:id
- **Description:** Deletes court if court doesn't have upcoming reservations. 
- **Query Parameters:**
  - id: number/ string (required)
- **Response:**
  - On success: HTTP 200 with success message.

### 7. Get Court Schedule

- **Endpoint:** GET /court/:id/schedule
- **Description:** Get court schedule with available times and pricing based on member type. 
- **Query Parameters:**
  - id: number (court ID; required)
  - date: string (YYYY-MM-DD; required)
  - time: number (duration in mins, eg. 30, 60, 90; optional)
- **Response:**
  - On success: HTTP 200 with JSON array of court_id, date, price_per_hour, open_hours,available_slots, available_start_times. Eg
  ```
  {
    "court_id": "1",
    "date": "2025-05-05",
    "price_per_hour": 20,
    "open_hours": [
        {
            "day_of_week": 1,
            "start_time": "08:00",
            "end_time": "17:00"
        }
    ],
    "available_slots": [
        {
            "start_time": "12:00",
            "end_time": "13:00",
            "duration_minutes": 60
        },
        {
            "start_time": "16:00",
            "end_time": "17:00",
            "duration_minutes": 60
        }
    ],
    "available_start_times": [
        "12:00",
        "16:00"
    ]
  }
  ```


## Main Server Endpoints

The main server (defined in backend/server.js) includes some additional endpoints:

### 1. Test Authentication Endpoint

- **Endpoint:** GET /success
- **Description:** A protected test endpoint that confirms the user is authenticated. Returns a simple success message.
- **Authentication:** Requires a valid JWT token.

### 2. Login Information Endpoint

- **Endpoint:** GET /login
- **Description:** This endpoint provides information on how to log in. It instructs users to perform a POST on /user/login with their credentials.
