
# Events API Documentation

This document provides detailed information about the Events API endpoints, including request parameters, response formats, and examples.

## Table of Contents
1. [Get All Events](#get-all-events)
2. [Get Upcoming Events](#get-upcoming-events)
3. [Get Event by ID](#get-event-by-id)
4. [Get Events by Place](#get-events-by-place)
5. [Get Events by Provider](#get-events-by-provider)
6. [Create Event](#create-event)
7. [Update Event](#update-event)
8. [Delete Event](#delete-event)
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)

## Get All Events
Retrieves a list of events with optional filtering.

- **URL**: `/api/events`
- **Method**: `GET`
- **Authentication**: Public

### Query Parameters
| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| location   | string | No       | Filter by location (partial match) |
| organizer  | string | No       | Filter by organizer name |
| startDate  | string | No       | Filter by start date (ISO format) |
| endDate    | string | No       | Filter by end date (ISO format) |
| provider_id| number | No       | Filter by provider ID |
| limit      | number | No       | Maximum number of results |
| sortBy     | string | No       | Field to sort by (default: startDate) |
| sortOrder  | string | No       | Sort order ('asc' or 'desc', default: 'asc') |

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "title": "Summer Festival",
      "description": "A wonderful summer festival with music and food",
      "startDate": "2025-07-15T14:00:00",
      "endDate": "2025-07-17T22:00:00",
      "location": "Central Park",
      "organizer": "City Council",
      "ticketPrice": 25.50,
      "capacity": 500,
      "images": ["festival1.jpg", "festival2.jpg"],
      "provider_id": 5,
      "createdAt": "2024-04-10T08:30:00",
      "updatedAt": "2024-04-10T08:30:00"
    },
    // More events...
  ],
  "count": 10,
  "message": "Events retrieved successfully",
  "filters": {
    "location": "Park",
    "limit": "10"
  }
}
```

## Get Upcoming Events
Retrieves events scheduled to occur in the future, sorted by start date.

- **URL**: `/api/events/upcoming`
- **Method**: `GET`
- **Authentication**: Public

### Query Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| limit     | number | No       | Maximum number of results (default: 10) |

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "data": [
    // Array of event objects
  ],
  "count": 5,
  "message": "Upcoming events retrieved successfully"
}
```

## Get Event by ID
Retrieves detailed information about a specific event by its ID.

- **URL**: `/api/events/:id`
- **Method**: `GET`
- **Authentication**: Public

### URL Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | number | Yes      | Event ID    |

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "Summer Festival",
    "description": "A wonderful summer festival with music and food",
    "startDate": "2025-07-15T14:00:00",
    "endDate": "2025-07-17T22:00:00",
    "location": "Central Park",
    "organizer": "City Council",
    "ticketPrice": 25.50,
    "capacity": 500,
    "images": ["festival1.jpg", "festival2.jpg"],
    "provider_id": 5,
    "createdAt": "2024-04-10T08:30:00",
    "updatedAt": "2024-04-10T08:30:00"
  },
  "message": "Event retrieved successfully"
}
```

### Error Response
- **Code**: 404 Not Found
```json
{
  "status": 404,
  "message": "Event not found"
}
```

## Get Events by Place
Retrieves all events associated with a specific place.

- **URL**: `/api/events/place/:placeId`
- **Method**: `GET`
- **Authentication**: Public

### URL Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| placeId   | number | Yes      | Place ID    |

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "data": [
    // Array of event objects
  ],
  "count": 3,
  "message": "Events for place ID 5 retrieved successfully",
  "place_id": "5"
}
```

## Get Events by Provider
Retrieves all events created by a specific provider.

- **URL**: `/api/events/provider/:providerId`
- **Method**: `GET`
- **Authentication**: Public

### URL Parameters
| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| providerId | number | Yes      | Provider ID |

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "data": [
    // Array of event objects
  ],
  "count": 8,
  "message": "Events by provider ID 3 retrieved successfully",
  "provider_id": "3"
}
```

## Create Event
Creates a new event with the provided information.

- **URL**: `/api/events`
- **Method**: `POST`
- **Authentication**: Public

### Request Body
| Field       | Type        | Required | Description |
|-------------|-------------|----------|-------------|
| title       | string      | Yes      | Event title (3-255 chars) |
| description | string      | Yes      | Event description (min 10 chars) |
| startDate   | string      | Yes      | Event start date and time (ISO format) |
| endDate     | string      | Yes      | Event end date and time (ISO format) |
| location    | string      | Yes      | Event location (2-255 chars) |
| organizer   | string      | No       | Event organizer (2-255 chars) |
| ticketPrice | number      | No       | Ticket price (>= 0) |
| capacity    | number      | No       | Maximum capacity (>= 1) |
| images      | array       | No       | Array of image URLs or filenames |
| provider_id | number      | No       | Provider user ID |

### Success Response
- **Code**: 201 Created
```json
{
  "status": 201,
  "message": "Event created successfully",
  "data": {
    "id": 15,
    "title": "New Summer Concert",
    "description": "An amazing concert under the stars",
    // All other event properties...
  }
}
```

### Error Response
- **Code**: 400 Bad Request
```json
{
  "status": 400,
  "errors": [
    {
      "param": "title",
      "msg": "Title is required",
      "location": "body"
    }
  ],
  "message": "Validation failed"
}
```

## Update Event
Updates an existing event with the provided information.

- **URL**: `/api/events/:id`
- **Method**: `PUT`
- **Authentication**: Public

### URL Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | number | Yes      | Event ID    |

### Request Body
Same fields as Create Event, but all fields are optional. Only include fields you want to update.

### Success Response
- **Code**: 200 OK
```json
{
  "status": 200,
  "message": "Event updated successfully",
  "data": {
    "id": 15,
    "title": "Updated Event Title",
    // All other event properties...
  },
  "updated_fields": ["title", "description"]
}
```

### Error Response
- **Code**: 404 Not Found
```json
{
  "status": 404,
  "message": "Event not found"
}
```

## Delete Event
Deletes an event by its ID.

- **URL**: `/api/events/:id`
- **Method**: `DELETE`
- **Authentication**: Public

### URL Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | number | Yes      | Event ID    |

### Success Response
- **Code**: 204 No Content

### Error Response
- **Code**: 404 Not Found
```json
{
  "status": 404,
  "message": "Event not found"
}
```

## Data Models

### Event Object
| Field       | Type        | Description |
|-------------|-------------|-------------|
| id          | number      | Unique identifier |
| title       | string      | Event title |
| description | string      | Detailed description |
| startDate   | string      | Start date and time (ISO format) |
| endDate     | string      | End date and time (ISO format) |
| location    | string      | Event location |
| organizer   | string      | Event organizer |
| ticketPrice | number      | Ticket price |
| capacity    | number      | Maximum capacity |
| images      | array       | Array of image URLs or filenames |
| provider_id | number      | Provider user ID |
| createdAt   | string      | Creation timestamp |
| updatedAt   | string      | Last update timestamp |

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "status": 4xx,
  "message": "Error description",
  "error": "Additional error details"
}
```

### Common Error Status Codes
- **400 Bad Request**: Invalid input data or validation failed
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected server error

### Validation Errors
Field validation errors return a 400 status code with detailed information about each field error:

```json
{
  "status": 400,
  "errors": [
    {
      "param": "title",
      "msg": "Title is required",
      "location": "body"
    },
    {
      "param": "startDate",
      "msg": "Start date must be a valid ISO 8601 date format",
      "location": "body"
    }
  ],
  "message": "Validation failed"
}
```

## Example Requests

### Create Event Example
```
POST /api/events
Content-Type: application/json

{
  "title": "Summer Music Festival",
  "description": "A weekend of live music and entertainment in beautiful surroundings",
  "startDate": "2025-08-15T14:00:00",
  "endDate": "2025-08-17T22:00:00",
  "location": "City Park",
  "organizer": "Music Events Inc.",
  "ticketPrice": 25.50,
  "capacity": 200,
  "images": [
    "festival1.jpg",
    "festival2.jpg"
  ],
  "provider_id": 5
}
```

### Update Event Example
```
PUT /api/events/15
Content-Type: application/json

{
  "title": "Summer Music Festival - Special Edition",
  "ticketPrice": 29.99,
  "capacity": 250
}
```

### Filter Events Example
```
GET /api/events?location=Park&startDate=2025-01-01T00:00:00&sortBy=ticketPrice&sortOrder=desc&limit=5
```

This will return up to 5 events with "Park" in the location, starting after January 1, 2025, sorted by ticket price in descending order.
