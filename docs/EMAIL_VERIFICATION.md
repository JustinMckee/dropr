# Email Verification Implementation

## Overview
This document describes the email verification flow implemented for user registration.

## Flow

### 1. User Registration
- User submits email, password, and display name to `POST /api/auth/register`
- System validates input (email format, password length, display name)
- System checks if email already exists
- Password is hashed using bcryptjs
- User and Profile records are created in database
- Verification token is generated (32-byte random hex string)
- Token is stored in `VerificationToken` table with 24-hour expiry
- Verification email is sent to user's email address

### 2. Email Verification
- User clicks verification link in email: `/api/auth/verify-email?token={token}`
- System validates token exists and hasn't expired
- User's `emailVerified` field is set to `true`
- Token is deleted from database
- User is redirected to login page with success message

### 3. Login with Email Verification Check
- User attempts to login via NextAuth credentials provider
- System validates email and password
- **New**: System checks if `emailVerified` is `true`
- If not verified, login is rejected with error message
- If verified, session is created

### 4. Resend Verification Email
- User can request new verification email via `POST /api/auth/resend-verification`
- System checks if user exists and is not already verified
- Old tokens are deleted, new token is generated
- New verification email is sent

## API Endpoints

### POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "member"
  }
}
```

### GET /api/auth/verify-email?token={token}
**Response:** Redirects to `/auth/login?verified=true`

### POST /api/auth/verify-email
**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

### POST /api/auth/resend-verification
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

## Email Service

The implementation uses [Resend](https://resend.com) for sending emails.

### Configuration
Set the following environment variable in `.env`:
```
RESEND_API_KEY=your_api_key_here
NEXTAUTH_URL=http://localhost:3000
```

### Email Template
The verification email includes:
- Welcome message
- Verification button/link
- 24-hour expiry notice
- Security notice for unintended registrations

## Database Schema

### VerificationToken Table
```prisma
model VerificationToken {
  identifier String   // User's email
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

### User Table
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  emailVerified Boolean  @default(false)
  // ... other fields
}
```

## Security Considerations

1. **Token Generation**: Uses cryptographically secure random bytes (32 bytes)
2. **Token Expiry**: Tokens expire after 24 hours
3. **One-Time Use**: Tokens are deleted after successful verification
4. **Email Privacy**: Resend endpoint doesn't reveal if email exists
5. **Login Protection**: Unverified users cannot login

## Testing

Unit tests are provided for:
- Registration flow with email sending
- Email verification (GET and POST)
- Token validation and expiry
- Error handling

Run tests with:
```bash
npm test
```

## Future Enhancements

- Rate limiting for verification email requests
- Custom email templates with branding
- Email verification reminder after X days
- Account cleanup for unverified users after Y days
