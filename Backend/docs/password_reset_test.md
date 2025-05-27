
# Password Reset API Testing with Postman

This document explains how to test the client-generated reset code functionality for password reset using Postman.

## Step 1: Request Password Reset

First, generate a random reset code on the client side and send it with the email.

- **URL**: `http://localhost:3000/api/password/forgot`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "user@example.com",
  "resetCode": "123456"
}
```

### Example Response
```json
{
  "status": 200,
  "message": "Reset code sent to user@example.com"
}
```

## Step 2: Reset Password

After the user receives the email with the code, they can reset their password by providing the same code.

- **URL**: `http://localhost:3000/api/password/reset`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "user@example.com",
  "resetCode": "123456",
  "newPassword": "NewSecurePassword123"
}
```

### Example Response
```json
{
  "status": 200,
  "message": "Password updated successfully"
}
```

## Notes

1. The password reset request expires after 15 minutes.
2. For testing purposes, you can use the sample user accounts created in the database:
   - Email: `user@example.com` (Regular user)
   - Email: `admin@example.com` (Admin user)
   - Email: `john@example.com` (Regular user)
   - Email: `jane@example.com` (Regular user)
3. The reset code is generated on the client side and sent to the server, which then emails it to the user.
4. You must use the exact same reset code in both the `/forgot` and `/reset` endpoints.
