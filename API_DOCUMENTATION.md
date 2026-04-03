# Account and Child Management APIs

## Overview
This document describes the account management endpoints for editing and deleting user accounts, as well as child management endpoints with profile image upload functionality.

## Prerequisites
- User must be authenticated with a valid JWT token
- Token should be included in the Authorization header as: `Bearer <token>`

---

## Edit Account

### Endpoint
`PUT /api/auth/account/edit`

### Authentication
Required - Bearer token in Authorization header

### Request Type
`multipart/form-data`

### Request Parameters

#### Form Data Fields:
- `name` (optional, string): Updated user name
- `email` (optional, string): Updated email address
- `profileImage` (optional, file): Profile image file (images only, max 5MB)

### Example Request (using cURL)

```bash
curl -X PUT http://localhost:5000/api/auth/account/edit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "email=johndoe@example.com" \
  -F "profileImage=@/path/to/profile.jpg"
```

### Example Request (using JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'johndoe@example.com');
formData.append('profileImage', fileInput.files[0]); // File from input element

const response = await fetch('http://localhost:5000/api/auth/account/edit', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Account updated successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "role": "parent",
      "profileImage": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567890-profile.jpg",
      "paymentSuccessfull": false,
      "isVerified": true,
      "plan": {
        "type": "individual",
        "childLimit": 5
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Responses

#### 400 - Email Already In Use
```json
{
  "message": "Email already in use"
}
```

#### 400 - Invalid File Type
```json
{
  "message": "Only image files are allowed"
}
```

#### 401 - Not Authenticated
```json
{
  "message": "Not authenticated"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Delete Account

### Endpoint
`DELETE /api/auth/account/delete`

### Authentication
Required - Bearer token in Authorization header

### Request Type
`application/json`

### Request Parameters
None required (user ID is extracted from the JWT token)

### Example Request (using cURL)

```bash
curl -X DELETE http://localhost:5000/api/auth/account/delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/auth/account/delete', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Account deleted successfully"
}
```

### Error Responses

#### 401 - Not Authenticated
```json
{
  "message": "Not authenticated"
}
```

#### 404 - User Not Found
```json
{
  "message": "User not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Notes

### Profile Image Upload
- Only image files are accepted (image/jpeg, image/png, image/gif, etc.)
- Maximum file size: 5MB
- Images are uploaded to AWS S3 bucket
- Previous profile images are automatically deleted when a new image is uploaded
- Image URLs are returned in the format: `https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/profile-images/{timestamp}-{filename}`

### Account Deletion
- When an account is deleted:
  - The user record is permanently removed from the database
  - Associated profile image is deleted from S3
  - All OTP records are deleted
  - Related child records should be handled separately (consider adding cascade delete)

### Security Considerations
- All endpoints require authentication via JWT token
- Email validation ensures no duplicate emails
- File upload validation ensures only images are accepted
- File size is limited to prevent abuse

### AWS S3 Configuration
Ensure the following environment variables are set in your `.env` file:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BUCKET_NAME=your_bucket_name
```

---

## Testing with Postman

### Edit Account
1. Set method to `PUT`
2. URL: `http://localhost:5000/api/auth/account/edit`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body:
   - Select `form-data`
   - Add fields: `name`, `email`, and `profileImage` (file)

### Delete Account
1. Set method to `DELETE`
2. URL: `http://localhost:5000/api/auth/account/delete`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
   - `Content-Type: application/json`

---

# Child Management APIs

## Create Child

### Endpoint
`POST /api/children`

### Authentication
Required - Bearer token in Authorization header

### Request Type
`multipart/form-data`

### Request Parameters

#### Form Data Fields:
- `name` (required, string): Child's name
- `age` (optional, number): Child's age
- `profileImage` (optional, file): Profile image file (images only, max 5MB)

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Johnny Doe" \
  -F "age=8" \
  -F "profileImage=@/path/to/child-photo.jpg"
```

### Example Request (using JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('name', 'Johnny Doe');
formData.append('age', '8');
formData.append('profileImage', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/children', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

### Success Response (201)

```json
{
  "message": "Child created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Johnny Doe",
    "age": 8,
    "profileImage": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567890-child-photo.jpg",
    "owner": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Invalid File Type
```json
{
  "message": "Only image files are allowed"
}
```

#### 401 - Unauthorized
```json
{
  "message": "Unauthorized"
}
```

#### 403 - Child Limit Reached
```json
{
  "message": "Child limit reached for individual plan"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Edit Child Details

### Endpoint
`PUT /api/children/:id`

### Authentication
Required - Bearer token in Authorization header

### Request Type
`multipart/form-data`

### URL Parameters
- `id` (required): Child's ID

### Request Parameters

#### Form Data Fields:
- `name` (optional, string): Updated child's name
- `age` (optional, number): Updated child's age
- `profileImage` (optional, file): Updated profile image file (images only, max 5MB)

### Example Request (using cURL)

```bash
curl -X PUT http://localhost:5000/api/children/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Johnny Doe Jr" \
  -F "age=9" \
  -F "profileImage=@/path/to/new-photo.jpg"
```

### Example Request (using JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('name', 'Johnny Doe Jr');
formData.append('age', '9');
formData.append('profileImage', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/children/507f1f77bcf86cd799439012', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Child updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Johnny Doe Jr",
    "age": 9,
    "profileImage": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567891-new-photo.jpg",
    "owner": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Invalid File Type
```json
{
  "message": "Only image files are allowed"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Delete Child

### Endpoint
`DELETE /api/children/:id`

### Authentication
Required - Bearer token in Authorization header

### URL Parameters
- `id` (required): Child's ID

### Request Type
`application/json`

### Example Request (using cURL)

```bash
curl -X DELETE http://localhost:5000/api/children/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/children/507f1f77bcf86cd799439012', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Child deleted successfully"
}
```

### Error Responses

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Child Management Notes

### Profile Image Upload for Children
- Same specifications as user profile images
- Only image files are accepted (image/jpeg, image/png, image/gif, etc.)
- Maximum file size: 5MB
- Images are uploaded to AWS S3 bucket in the `profile-images/` folder
- Previous profile images are automatically deleted when a new image is uploaded

### Child Deletion
- When a child is deleted:
  - The child record is permanently removed from the database
  - Associated profile image is deleted from S3
  - Only the owner (parent) can delete their children

### Child Ownership
- Only the authenticated user who owns the child can edit or delete it
- Child limit is enforced based on the user's subscription plan:
  - Individual: 5 children
  - Family: 15 children
  - Company: 30 children

---

## Testing Child APIs with Postman

### Create Child
1. Set method to `POST`
2. URL: `http://localhost:5000/api/children`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body:
   - Select `form-data`
   - Add fields: `name`, `age`, and `profileImage` (file)

### Edit Child Details
1. Set method to `PUT`
2. URL: `http://localhost:5000/api/children/:id` (replace `:id` with actual child ID)
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body:
   - Select `form-data`
   - Add fields: `name`, `age`, and/or `profileImage` (file)

### Delete Child
1. Set method to `DELETE`
2. URL: `http://localhost:5000/api/children/:id` (replace `:id` with actual child ID)
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
   - `Content-Type: application/json`

---

# Child Session Management APIs

## Overview
These APIs allow parents to activate/deactivate child sessions on their device. When a child is "logged in", the frontend can use the session information to restrict access to parental features and provide a child-friendly interface.

## Child Login (Activate Child Session)

### Endpoint
`POST /api/children/:id/login`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `id` (required): Child's ID to activate

### Request Type
`application/json`

### Request Parameters

#### Body Fields:
- `deviceId` (optional, string): Unique device identifier from frontend

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/children/507f1f77bcf86cd799439012/login \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device-12345"}'
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/children/507f1f77bcf86cd799439012/login', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deviceId: 'device-12345' // Optional
  })
});

const data = await response.json();

// Store sessionInfo in frontend state/context
const { sessionInfo } = data.data;
if (sessionInfo.isChildMode) {
  // Hide parental features
  // Show child-friendly UI
}
```

### Success Response (200)

```json
{
  "message": "Child logged in successfully",
  "data": {
    "child": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Johnny Doe",
      "age": 8,
      "profileImage": "https://...",
      "owner": "507f1f77bcf86cd799439011",
      "session": {
        "isLoggedIn": true,
        "deviceId": "device-12345",
        "loggedInAt": "2024-01-01T12:00:00.000Z"
      }
    },
    "sessionInfo": {
      "isChildMode": true,
      "role": "child",
      "childId": "507f1f77bcf86cd799439012",
      "childName": "Johnny Doe",
      "parentId": "507f1f77bcf86cd799439011",
      "loggedInAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Responses

#### 403 - Already Logged In On Another Device
```json
{
  "message": "Child is already logged in on another device",
  "deviceId": "device-67890"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Child Logout (Deactivate Child Session)

### Endpoint
`POST /api/children/:id/logout`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `id` (required): Child's ID to deactivate

### Request Type
`application/json`

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/children/507f1f77bcf86cd799439012/logout \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/children/507f1f77bcf86cd799439012/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();

// Update frontend state back to parent mode
const { sessionInfo } = data.data;
if (!sessionInfo.isChildMode) {
  // Show parental features
  // Switch back to parent UI
}
```

### Success Response (200)

```json
{
  "message": "Child logged out successfully",
  "data": {
    "child": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Johnny Doe",
      "age": 8,
      "profileImage": "https://...",
      "owner": "507f1f77bcf86cd799439011",
      "session": {
        "isLoggedIn": false
      }
    },
    "sessionInfo": {
      "isChildMode": false,
      "role": "parent"
    }
  }
}
```

### Error Responses

#### 400 - Child Not Logged In
```json
{
  "message": "Child is not logged in"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Get Active Child Session

### Endpoint
`GET /api/children/session/active`

### Authentication
Required - Parent's Bearer token in Authorization header

### Request Type
`application/json`

### Use Case
Call this endpoint when the app loads to check if there's an active child session on the current device.

### Example Request (using cURL)

```bash
curl -X GET http://localhost:5000/api/children/session/active \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN"
```

### Example Request (using JavaScript/Fetch)

```javascript
// Call this on app initialization
const response = await fetch('http://localhost:5000/api/children/session/active', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();

if (data.data.hasActiveSession) {
  // Restore child mode UI
  const { sessionInfo } = data.data;
  // Use sessionInfo to configure app
} else {
  // Show parent mode UI
}
```

### Success Response (200) - With Active Session

```json
{
  "message": "Active child session found",
  "data": {
    "hasActiveSession": true,
    "child": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Johnny Doe",
      "age": 8,
      "profileImage": "https://...",
      "owner": "507f1f77bcf86cd799439011",
      "session": {
        "isLoggedIn": true,
        "deviceId": "device-12345",
        "loggedInAt": "2024-01-01T12:00:00.000Z"
      }
    },
    "sessionInfo": {
      "isChildMode": true,
      "role": "child",
      "childId": "507f1f77bcf86cd799439012",
      "childName": "Johnny Doe",
      "parentId": "507f1f77bcf86cd799439011",
      "loggedInAt": "2024-01-01T12:00:00.000Z",
      "deviceId": "device-12345"
    }
  }
}
```

### Success Response (200) - No Active Session

```json
{
  "message": "No active child session",
  "data": {
    "hasActiveSession": false,
    "sessionInfo": {
      "isChildMode": false,
      "role": "parent"
    }
  }
}
```

### Error Responses

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Child Session Management Implementation Guide

### Frontend Implementation Flow

#### 1. Parent Login Flow
```javascript
// After parent logs in successfully
const parentLoginResponse = await loginParent(email, password);
const { accessToken, user } = parentLoginResponse.data;

// Store parent token
localStorage.setItem('parentToken', accessToken);

// Check for active child session
const sessionResponse = await fetch('/api/children/session/active', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const sessionData = await sessionResponse.json();

if (sessionData.data.hasActiveSession) {
  // Restore child mode
  setAppMode('child');
  setActiveChild(sessionData.data.child);
} else {
  // Show parent mode
  setAppMode('parent');
}
```

#### 2. Selecting a Child (Activating Child Mode)
```javascript
// When parent clicks on a child to activate
const activateChild = async (childId) => {
  const deviceId = generateDeviceId(); // Generate unique device ID

  const response = await fetch(`/api/children/${childId}/login`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ deviceId })
  });

  const data = await response.json();

  if (data.data.sessionInfo.isChildMode) {
    // Switch to child mode
    setAppMode('child');
    setActiveChild(data.data.child);

    // Hide parental features in UI
    hideParentalFeatures();

    // Show child-friendly interface
    showChildInterface();
  }
};
```

#### 3. Logging Out Child (Switching Back to Parent Mode)
```javascript
// When logging out child
const deactivateChild = async (childId) => {
  const response = await fetch(`/api/children/${childId}/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!data.data.sessionInfo.isChildMode) {
    // Switch back to parent mode
    setAppMode('parent');
    setActiveChild(null);

    // Show parental features
    showParentalFeatures();
  }
};
```

#### 4. Conditional Rendering Based on Mode
```javascript
// In your React/Vue/Angular components
{sessionInfo.isChildMode ? (
  <ChildModeInterface child={activeChild} />
) : (
  <ParentModeInterface user={parent} children={childrenList} />
)}

// Or restrict specific features
{!sessionInfo.isChildMode && (
  <ParentalControlButton />
)}
```

### Key Session Fields Explained

- **`isChildMode`**: Boolean flag to determine if app should be in child mode
- **`role`**: Either "child" or "parent" - use this for conditional rendering
- **`childId`**: Active child's ID
- **`childName`**: Active child's name (for displaying in UI)
- **`parentId`**: Parent's ID (always maintain parent's token for API calls)
- **`loggedInAt`**: Timestamp when child was activated
- **`deviceId`**: Unique device identifier to prevent multi-device login

### Device Management

The `deviceId` parameter allows you to:
1. Prevent child from being logged in on multiple devices simultaneously
2. Track which device the child is using
3. Force logout from other devices when needed

Generate a unique device ID on the frontend:
```javascript
const generateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};
```

### Security Considerations

1. **Always use parent's JWT token** for all API calls, even in child mode
2. **Frontend-only restriction**: Child mode restrictions are enforced in the UI, not API
3. **Session state**: Store session state in frontend (Redux/Context/Vuex)
4. **Single device**: Child can only be active on one device at a time
5. **Auto-logout**: Consider implementing auto-logout after inactivity

---

## Testing Child Session APIs with Postman

### 1. Activate Child Session
1. Set method to `POST`
2. URL: `http://localhost:5000/api/children/:id/login`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "deviceId": "test-device-123"
   }
   ```

### 2. Check Active Session
1. Set method to `GET`
2. URL: `http://localhost:5000/api/children/session/active`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`

### 3. Deactivate Child Session
1. Set method to `POST`
2. URL: `http://localhost:5000/api/children/:id/logout`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`

---

## Parental Control - Force Logout Child

### Endpoint
`POST /api/children/:id/force-logout`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `id` (required): Child's ID to force logout

### Request Type
`application/json`

### Use Case
This endpoint allows parents to remotely force logout a child from any device. This is useful for:
- Parental control from a parent dashboard
- Remotely ending a child's session when needed
- Managing screen time limits
- Emergency logout situations

**Difference from regular logout:**
- Works from any device (parent doesn't need to be on the same device)
- Can be called from parent's dashboard/settings
- Forces logout even if child is on a different device
- Useful for remote parental control

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/children/507f1f77bcf86cd799439012/force-logout \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Example Request (using JavaScript/Fetch)

```javascript
// Parent can call this from their dashboard to logout child remotely
const forceLogoutChild = async (childId) => {
  const response = await fetch(`http://localhost:5000/api/children/${childId}/force-logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  // Show notification to parent
  alert(`${data.message}`);

  // On the child's device, you should poll /session/active periodically
  // to detect when parent has force logged them out
};
```

### Success Response (200) - Child Was Logged In

```json
{
  "message": "Child force logged out successfully by parent",
  "data": {
    "child": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Johnny Doe",
      "age": 8,
      "profileImage": "https://...",
      "owner": "507f1f77bcf86cd799439011",
      "session": {
        "isLoggedIn": false
      }
    },
    "previousSession": {
      "wasLoggedIn": true,
      "deviceId": "device-12345"
    },
    "sessionInfo": {
      "isChildMode": false,
      "role": "parent"
    }
  }
}
```

### Success Response (200) - Child Was Not Logged In

```json
{
  "message": "Child session cleared (was not logged in)",
  "data": {
    "child": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Johnny Doe",
      "age": 8,
      "profileImage": "https://...",
      "owner": "507f1f77bcf86cd799439011",
      "session": {
        "isLoggedIn": false
      }
    },
    "previousSession": {
      "wasLoggedIn": false,
      "deviceId": undefined
    },
    "sessionInfo": {
      "isChildMode": false,
      "role": "parent"
    }
  }
}
```

### Error Responses

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

---

## Detecting Force Logout on Child's Device

To detect when a parent has force logged out a child, implement polling on the child's device:

```javascript
// Poll every 30 seconds to check if child is still logged in
const checkSessionStatus = async () => {
  if (!sessionInfo.isChildMode) return; // Only check if in child mode

  const response = await fetch('/api/children/session/active', {
    headers: { 'Authorization': `Bearer ${parentToken}` }
  });

  const data = await response.json();

  // If no active session found but we think child is logged in
  if (!data.data.hasActiveSession && sessionInfo.isChildMode) {
    // Parent has force logged out the child
    alert('Your parent has ended your session');

    // Switch back to parent mode or lock screen
    setAppMode('parent');
    setActiveChild(null);

    // Optionally lock the app or show a message
    showParentLockScreen();
  }
};

// Start polling when child logs in
let pollInterval;
if (sessionInfo.isChildMode) {
  pollInterval = setInterval(checkSessionStatus, 30000); // Check every 30 seconds
}

// Stop polling when child logs out normally
if (!sessionInfo.isChildMode && pollInterval) {
  clearInterval(pollInterval);
}
```

---

## Parental Control Implementation Example

### Parent Dashboard with Force Logout Button

```javascript
// In your parent dashboard component
const ParentDashboard = () => {
  const [children, setChildren] = useState([]);

  const handleForceLogout = async (childId, childName) => {
    if (!confirm(`Force logout ${childName}? This will end their session immediately.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/children/${childId}/force-logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${parentToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.data.previousSession.wasLoggedIn) {
        alert(`${childName} has been logged out from device: ${data.data.previousSession.deviceId}`);
      } else {
        alert(`${childName} was not logged in`);
      }

      // Refresh children list to update session status
      fetchChildren();
    } catch (error) {
      console.error('Error force logging out child:', error);
      alert('Failed to logout child');
    }
  };

  return (
    <div>
      <h2>Your Children</h2>
      {children.map(child => (
        <div key={child._id}>
          <span>{child.name}</span>
          {child.session?.isLoggedIn ? (
            <div>
              <span className="status-badge">Logged In</span>
              <span>Device: {child.session.deviceId}</span>
              <button onClick={() => handleForceLogout(child._id, child.name)}>
                Force Logout
              </button>
            </div>
          ) : (
            <span className="status-badge">Not Logged In</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Testing Parental Force Logout with Postman

### Force Logout Child (Parental Control)
1. Set method to `POST`
2. URL: `http://localhost:5000/api/children/:id/force-logout`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`
4. No body required

---

# Child Progress APIs

## Overview
These APIs allow tracking and managing child progress with images and rewards. Each progress entry contains an array of images (with index and URL) and an optional reward image.

## Save Child Progress (with URLs)

### Endpoint
`POST /api/child/:childId/progress`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Request Type
`application/json`

### Request Parameters

#### Body Fields:
- `images` (required, array): Array of image objects with index and url
  - `index` (number): Index/order of the image
  - `url` (string): URL of the image
- `rewardImage` (optional, string): URL of the reward image

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {"index": 0, "url": "https://example.com/image1.jpg"},
      {"index": 1, "url": "https://example.com/image2.jpg"}
    ],
    "rewardImage": "https://example.com/reward.jpg"
  }'
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    images: [
      { index: 0, url: 'https://example.com/image1.jpg' },
      { index: 1, url: 'https://example.com/image2.jpg' },
      { index: 2, url: 'https://example.com/image3.jpg' }
    ],
    rewardImage: 'https://example.com/reward.jpg'
  })
});

const data = await response.json();
```

### Success Response (201)

```json
{
  "message": "Progress saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "childId": "507f1f77bcf86cd799439012",
    "images": [
      { "index": 0, "url": "https://example.com/image1.jpg" },
      { "index": 1, "url": "https://example.com/image2.jpg" }
    ],
    "rewardImage": "https://example.com/reward.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Invalid Images Format
```json
{
  "message": "Images array is required"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

---

## Save Child Progress (with Image Upload)

### Endpoint
`POST /api/child/:childId/progress/upload`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Request Type
`multipart/form-data`

### Request Parameters

#### Form Data Fields:
- `images` (required, files): Multiple image files (max 10)

### Example Request (using JavaScript/Fetch)

```javascript
const formData = new FormData();

// Add multiple images
const imageFiles = document.getElementById('imageInput').files;
for (let i = 0; i < imageFiles.length; i++) {
  formData.append('images', imageFiles[i]);
}

const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`
  },
  body: formData
});

const data = await response.json();
```

### Success Response (201)

```json
{
  "message": "Progress saved successfully with uploaded images",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "childId": "507f1f77bcf86cd799439012",
    "images": [
      {
        "index": 0,
        "url": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567890-image1.jpg"
      },
      {
        "index": 1,
        "url": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567891-image2.jpg"
      }
    ],
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Get All Progress for a Child

### Endpoint
`GET /api/child/:childId/progress`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Query Parameters
- `limit` (optional, number): Number of entries to return (default: 10)
- `skip` (optional, number): Number of entries to skip (default: 0)

### Example Request

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress?limit=20&skip=0', {
  headers: {
    'Authorization': `Bearer ${parentToken}`
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Progress fetched successfully",
  "data": {
    "progress": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "childId": "507f1f77bcf86cd799439012",
        "images": [
          { "index": 0, "url": "https://example.com/image1.jpg" },
          { "index": 1, "url": "https://example.com/image2.jpg" }
        ],
        "rewardImage": "https://example.com/reward.jpg",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 5,
    "limit": 10,
    "skip": 0
  }
}
```

---

## Get Single Progress Entry

### Endpoint
`GET /api/child/:childId/progress/:progressId`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID
- `progressId` (required): Progress entry ID

### Success Response (200)

```json
{
  "message": "Progress fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "childId": "507f1f77bcf86cd799439012",
    "images": [
      { "index": 0, "url": "https://example.com/image1.jpg" },
      { "index": 1, "url": "https://example.com/image2.jpg" }
    ],
    "rewardImage": "https://example.com/reward.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Update Child Progress

### Endpoint
`PUT /api/child/:childId/progress/:progressId`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID
- `progressId` (required): Progress entry ID

### Request Type
`application/json`

### Request Parameters

#### Body Fields:
- `images` (optional, array): Updated array of image objects
- `rewardImage` (optional, string): Updated reward image URL

### Example Request

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress/507f1f77bcf86cd799439013', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    images: [
      { index: 0, url: 'https://example.com/updated-image1.jpg' },
      { index: 1, url: 'https://example.com/updated-image2.jpg' }
    ],
    rewardImage: 'https://example.com/new-reward.jpg'
  })
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Progress updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "childId": "507f1f77bcf86cd799439012",
    "images": [
      { "index": 0, "url": "https://example.com/updated-image1.jpg" },
      { "index": 1, "url": "https://example.com/updated-image2.jpg" }
    ],
    "rewardImage": "https://example.com/new-reward.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

---

## Delete Child Progress

### Endpoint
`DELETE /api/child/:childId/progress/:progressId`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID
- `progressId` (required): Progress entry ID

### Example Request

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress/507f1f77bcf86cd799439013', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Progress deleted successfully"
}
```

**Note:** This also deletes all associated images from S3.

---

## Add/Update Reward Image

### Endpoint
`POST /api/child/:childId/progress/:progressId/reward`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID
- `progressId` (required): Progress entry ID

### Request Type
`multipart/form-data`

### Request Parameters

#### Form Data Fields:
- `rewardImage` (required, file): Reward image file

### Example Request

```javascript
const formData = new FormData();
formData.append('rewardImage', rewardImageFile);

const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/progress/507f1f77bcf86cd799439013/reward', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`
  },
  body: formData
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Reward image added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "childId": "507f1f77bcf86cd799439012",
    "images": [
      { "index": 0, "url": "https://example.com/image1.jpg" }
    ],
    "rewardImage": "https://exceptional-learning-app.s3.us-east-1.amazonaws.com/profile-images/1234567892-reward.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

---

## Child Progress Testing with Postman

### 1. Save Progress with URLs
1. Method: `POST`
2. URL: `http://localhost:5000/api/child/:childId/progress`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "images": [
       {"index": 0, "url": "https://example.com/image1.jpg"},
       {"index": 1, "url": "https://example.com/image2.jpg"}
     ],
     "rewardImage": "https://example.com/reward.jpg"
   }
   ```

### 2. Save Progress with Image Upload
1. Method: `POST`
2. URL: `http://localhost:5000/api/child/:childId/progress/upload`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
4. Body:
   - Select `form-data`
   - Add multiple files with key `images`

### 3. Get All Progress
1. Method: `GET`
2. URL: `http://localhost:5000/api/child/:childId/progress?limit=10&skip=0`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`

### 4. Add Reward Image
1. Method: `POST`
2. URL: `http://localhost:5000/api/child/:childId/progress/:progressId/reward`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
4. Body:
   - Select `form-data`
   - Add file with key `rewardImage`

---

# Child Token Board Progress APIs

## Overview
The Token Board Progress system provides a fixed 5-token tracking mechanism for children. Each child can have one active token board with 5 tokens (indexed 1-5) that can be toggled active/inactive. The system also supports setting a reward URL that can be displayed when tokens are completed.

## Key Features
- Fixed 5-token structure (indices 1-5)
- Each token has an `isActive` boolean status
- One token board per child (unique constraint)
- Optional reward URL
- Auto-initialization on first access
- Reset functionality to clear all tokens

---

## Get or Create Token Board

### Endpoint
`GET /api/child/:childId/tokenboard`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Behavior
- If token board exists, returns it
- If token board doesn't exist, creates a new one with all tokens set to `isActive: false`

### Example Request (using cURL)

```bash
curl -X GET http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard', {
  headers: {
    'Authorization': `Bearer ${parentToken}`
  }
});

const data = await response.json();
console.log(data.data.tokens); // Array of 5 tokens
```

### Success Response (200)

```json
{
  "message": "Token board fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "childId": "507f1f77bcf86cd799439012",
    "tokens": [
      { "index": 1, "isActive": false },
      { "index": 2, "isActive": false },
      { "index": 3, "isActive": false },
      { "index": 4, "isActive": false },
      { "index": 5, "isActive": false }
    ],
    "rewardUrl": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

---

## Update Token Index

### Endpoint
`PUT /api/child/:childId/tokenboard/token`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Request Type
`application/json`

### Request Parameters

#### Body Fields:
- `index` (required, number): Token index (1-5)
- `isActive` (required, boolean): New active status

### Example Request (using cURL)

```bash
curl -X PUT http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/token \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "index": 1,
    "isActive": true
  }'
```

### Example Request (using JavaScript/Fetch)

```javascript
// Toggle a token on
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/token', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    index: 1,
    isActive: true
  })
});

const data = await response.json();

// Toggle a token off
const response2 = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/token', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    index: 3,
    isActive: false
  })
});
```

### Success Response (200)

```json
{
  "message": "Token updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "childId": "507f1f77bcf86cd799439012",
    "tokens": [
      { "index": 1, "isActive": true },
      { "index": 2, "isActive": false },
      { "index": 3, "isActive": false },
      { "index": 4, "isActive": false },
      { "index": 5, "isActive": false }
    ],
    "rewardUrl": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z"
  }
}
```

### Error Responses

#### 400 - Invalid Index
```json
{
  "message": "Index must be between 1 and 5"
}
```

#### 400 - Invalid isActive Value
```json
{
  "message": "isActive must be a boolean value"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

---

## Update Reward URL

### Endpoint
`PUT /api/child/:childId/tokenboard/reward`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Request Type
`application/json`

### Request Parameters

#### Body Fields:
- `rewardUrl` (optional, string): URL of the reward image/content

### Example Request (using cURL)

```bash
curl -X PUT http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/reward \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rewardUrl": "https://example.com/rewards/star-badge.png"
  }'
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/reward', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rewardUrl: 'https://example.com/rewards/star-badge.png'
  })
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Reward URL updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "childId": "507f1f77bcf86cd799439012",
    "tokens": [
      { "index": 1, "isActive": true },
      { "index": 2, "isActive": true },
      { "index": 3, "isActive": false },
      { "index": 4, "isActive": false },
      { "index": 5, "isActive": false }
    ],
    "rewardUrl": "https://example.com/rewards/star-badge.png",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

---

## Reset Token Board

### Endpoint
`POST /api/child/:childId/tokenboard/reset`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Request Type
`application/json`

### Use Case
Resets all tokens to `isActive: false` while keeping the reward URL intact. Useful for starting a new cycle.

### Example Request (using cURL)

```bash
curl -X POST http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/reset \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard/reset', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Token board reset successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "childId": "507f1f77bcf86cd799439012",
    "tokens": [
      { "index": 1, "isActive": false },
      { "index": 2, "isActive": false },
      { "index": 3, "isActive": false },
      { "index": 4, "isActive": false },
      { "index": 5, "isActive": false }
    ],
    "rewardUrl": "https://example.com/rewards/star-badge.png",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T14:00:00.000Z"
  }
}
```

### Error Responses

#### 404 - Token Board Not Found
```json
{
  "message": "Token board not found"
}
```

#### 404 - Child Not Found
```json
{
  "message": "Child not found"
}
```

---

## Delete Token Board

### Endpoint
`DELETE /api/child/:childId/tokenboard`

### Authentication
Required - Parent's Bearer token in Authorization header

### URL Parameters
- `childId` (required): Child's ID

### Example Request (using cURL)

```bash
curl -X DELETE http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard \
  -H "Authorization: Bearer YOUR_PARENT_JWT_TOKEN"
```

### Example Request (using JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/child/507f1f77bcf86cd799439012/tokenboard', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${parentToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "message": "Token board deleted successfully"
}
```

### Error Responses

#### 404 - Token Board Not Found
```json
{
  "message": "Token board not found"
}
```

---

## Token Board Implementation Guide

### Frontend Implementation Flow

#### 1. Load Token Board on Page Load

```javascript
const loadTokenBoard = async (childId) => {
  const response = await fetch(`/api/child/${childId}/tokenboard`, {
    headers: {
      'Authorization': `Bearer ${parentToken}`
    }
  });

  const data = await response.json();
  const { tokens, rewardUrl } = data.data;

  // Render the token board
  renderTokenBoard(tokens, rewardUrl);
};
```

#### 2. Toggle Token Active Status

```javascript
const toggleToken = async (childId, index, currentStatus) => {
  const newStatus = !currentStatus;

  const response = await fetch(`/api/child/${childId}/tokenboard/token`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      index: index,
      isActive: newStatus
    })
  });

  const data = await response.json();

  // Update UI with new token board state
  updateTokenBoard(data.data.tokens);

  // Check if all tokens are active for reward display
  const allActive = data.data.tokens.every(t => t.isActive);
  if (allActive && data.data.rewardUrl) {
    showReward(data.data.rewardUrl);
  }
};
```

#### 3. Set Reward URL

```javascript
const setRewardUrl = async (childId, rewardUrl) => {
  const response = await fetch(`/api/child/${childId}/tokenboard/reward`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rewardUrl: rewardUrl
    })
  });

  const data = await response.json();
  console.log('Reward URL updated:', data.data.rewardUrl);
};
```

#### 4. Reset Token Board After Completion

```javascript
const resetTokenBoard = async (childId) => {
  if (!confirm('Reset all tokens? This will clear the child\'s progress.')) {
    return;
  }

  const response = await fetch(`/api/child/${childId}/tokenboard/reset`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  // Refresh UI to show reset tokens
  updateTokenBoard(data.data.tokens);
  alert('Token board has been reset!');
};
```

#### 5. Example React Component

```javascript
const TokenBoard = ({ childId }) => {
  const [tokens, setTokens] = useState([]);
  const [rewardUrl, setRewardUrl] = useState(null);

  useEffect(() => {
    loadTokenBoard();
  }, [childId]);

  const loadTokenBoard = async () => {
    const response = await fetch(`/api/child/${childId}/tokenboard`, {
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const data = await response.json();
    setTokens(data.data.tokens);
    setRewardUrl(data.data.rewardUrl);
  };

  const handleTokenClick = async (index, currentStatus) => {
    const response = await fetch(`/api/child/${childId}/tokenboard/token`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${parentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        index: index,
        isActive: !currentStatus
      })
    });

    const data = await response.json();
    setTokens(data.data.tokens);

    // Check if all complete
    const allActive = data.data.tokens.every(t => t.isActive);
    if (allActive && rewardUrl) {
      alert('All tokens completed! You earned a reward!');
    }
  };

  const handleReset = async () => {
    const response = await fetch(`/api/child/${childId}/tokenboard/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${parentToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    setTokens(data.data.tokens);
  };

  return (
    <div className="token-board">
      <h3>Token Board</h3>
      <div className="tokens">
        {tokens.map((token) => (
          <div
            key={token.index}
            className={`token ${token.isActive ? 'active' : 'inactive'}`}
            onClick={() => handleTokenClick(token.index, token.isActive)}
          >
            {token.index}
          </div>
        ))}
      </div>
      {tokens.every(t => t.isActive) && rewardUrl && (
        <div className="reward">
          <img src={rewardUrl} alt="Reward" />
        </div>
      )}
      <button onClick={handleReset}>Reset Board</button>
    </div>
  );
};
```

---

## Token Board Use Cases

### 1. Behavior Tracking
- Each token represents a positive behavior or completed task
- Parent toggles token when child completes a task
- When all 5 tokens are active, child earns the reward

### 2. Daily Goals
- 5 daily goals/tasks
- Child works through them one by one
- Reset at end of day for next day's goals

### 3. Weekly Progress
- Each token represents a day of the week (Monday-Friday)
- Track weekly goal completion
- Reset on weekends

### 4. Skill Mastery
- 5 levels of skill progression
- Each token represents a mastery level
- Reward shown when all levels complete

---

## Token Board Testing with Postman

### 1. Get/Create Token Board
1. Method: `GET`
2. URL: `http://localhost:5000/api/child/:childId/tokenboard`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`

### 2. Update Token Index
1. Method: `PUT`
2. URL: `http://localhost:5000/api/child/:childId/tokenboard/token`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "index": 1,
     "isActive": true
   }
   ```

### 3. Update Reward URL
1. Method: `PUT`
2. URL: `http://localhost:5000/api/child/:childId/tokenboard/reward`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "rewardUrl": "https://example.com/reward.png"
   }
   ```

### 4. Reset Token Board
1. Method: `POST`
2. URL: `http://localhost:5000/api/child/:childId/tokenboard/reset`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
   - `Content-Type: application/json`

### 5. Delete Token Board
1. Method: `DELETE`
2. URL: `http://localhost:5000/api/child/:childId/tokenboard`
3. Headers:
   - `Authorization: Bearer PARENT_JWT_TOKEN`
