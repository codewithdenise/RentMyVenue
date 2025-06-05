# RentMyVenue API Setup and Structure Summary

## Backend API Overview

The backend is built using Django REST Framework and is organized into several apps:

- **accounts**: User authentication and profile management.
- **venues**: Venue-related data including public venues, categories, locations, amenities, vendor/admin venues, images, and audit logs.
- **bookings**: Booking management, booking state logs, payment verification, and payment gateway webhook.
- **notifications**: Notifications and messages management.
- **config**: Project configuration including main URL routing.

### Main URL Routing (backend/config/urls.py)

- `/admin/` - Django admin interface.
- `/api/accounts/` - User accounts API.
- `/api/` - Venues, bookings, and notifications APIs.
- `/test-payment/` - Payment test page.

## Accounts API Endpoints (`/api/accounts/`)

- `POST /register/` - Register a new user.
- `POST /login/` - User login.
- `POST /login/otp/verify/` - OTP verification for login.
- `POST /token/refresh/` - Refresh JWT token.
- `POST /token/verify/` - Verify JWT token.
- `POST /logout/` - Logout and blacklist token.
- `GET /me/` - Get current user profile.

## Venues API Endpoints (`/api/`)

- `GET /venues/` - Public venues.
- `GET /categories/` - Venue categories.
- `GET /states/` - States.
- `GET /districts/` - Districts.
- `GET /tehsils/` - Tehsils.
- `GET /amenities/` - Amenities.
- `GET /vendor/venues/` - Vendor-specific venues.
- `GET /admin/venues/` - Admin-specific venues.
- `POST /venue-images/` - Upload venue images.
- `GET /auditlogs/` - Audit logs.
- `GET /featured-venues/` - Featured venues list.

## Bookings API Endpoints (`/api/`)

- `GET/POST/PUT/PATCH/DELETE /bookings/` - Booking CRUD operations.
- `GET/POST/PUT/PATCH/DELETE /bookings/{booking_id}/logs/` - Booking state logs.
- `POST /bookings/{booking_id}/verify-payment/` - Verify payment for a booking.
- `POST /razorpay/webhook/` - Razorpay payment gateway webhook.
- `/test-payment/` - Payment test page.

## Notifications API Endpoints (`/api/`)

- `GET/POST/PUT/PATCH/DELETE /notifications/` - Notifications management.
- `GET/POST/PUT/PATCH/DELETE /messages/` - Messages management.

## Frontend API Client (frontend/src/services/api.ts)

- Uses fetch API with base URL from environment variable `VITE_API_URL` or default `http://127.0.0.1:8000`.
- Sets `Content-Type` to `application/json`.
- Includes `Authorization: Bearer <token>` header if token is stored in `localStorage` under `rentmyvenue_token`.
- Supports request timeout (5 seconds).
- Provides methods: `get`, `post`, `put`, `patch`, `delete`.
- Handles errors with custom error classes: `ApiError`, `NetworkError`, `TimeoutError`.

## Additional Notes

- Admin interface is available at `/admin/`.
- Payment test page available at `/test-payment/`.
- API uses JWT authentication with token refresh and blacklist.
- Backend uses Django REST Framework routers for automatic URL routing of viewsets.
- Frontend API client is designed to be extensible for all backend endpoints.

---

This summary provides a complete overview of the API setup and structure for RentMyVenue. It can be shared with frontend designers or other AI systems to facilitate frontend design or redesign based on the backend API.
