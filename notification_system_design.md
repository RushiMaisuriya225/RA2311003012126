# Campus Notifications Microservice: System Design

## Stage 1: RESTful API Design
To serve the frontend efficiently, we require two primary endpoints.

### 1. Fetch Notifications
*   **Endpoint:** `GET /api/v1/notifications`
*   **Purpose:** Retrieves a paginated list of notifications for the authenticated student.
*   **Query Parameters:** `?status=unread&limit=10&page=1`
*   **Response (200 OK):**
```json
{
  "studentId": "1042",
  "data": [
    {
      "notificationId": "n_987",
      "type": "Placement",
      "message": "Infosys interview scheduled for tomorrow at 10 AM.",
      "isRead": false,
      "createdAt": "2026-05-02T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}