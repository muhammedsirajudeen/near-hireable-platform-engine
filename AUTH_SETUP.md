# Authentication System Setup

This project now includes a comprehensive JWT-based authentication system with the following features:

## Features

-  **Admin Login**: Password-only authentication for admin access
-  **User Signup**: Email/password registration (only for authorized emails)
-  **User Signin**: Email/password authentication
-  **JWT Tokens**: Access and refresh tokens stored in HTTP-only cookies
-  **Automatic Token Refresh**: Axios interceptors handle token refresh automatically
-  **Protected Routes**: Route guards for authenticated and admin-only pages

## Setup Instructions

### 1. Environment Variables

You need to add the following environment variables to your `.env.local` file:

```env
# MongoDB Connection (already exists)
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Admin Configuration
ADMIN_PASSWORD=your_admin_password_change_this
```

**Important**: Make sure to change the secrets and admin password to secure values in production!

### 2. API Endpoints

The following API endpoints are available:

-  `POST /api/auth/admin/login` - Admin login with password
-  `POST /api/auth/signup` - User signup (requires authorized email)
-  `POST /api/auth/signin` - User signin
-  `POST /api/auth/refresh` - Refresh access token
-  `POST /api/auth/logout` - Logout and clear cookies
-  `GET /api/auth/me` - Get current authenticated user

### 3. Frontend Pages

-  `/admin/login` - Admin login page
-  `/signup` - User signup page
-  `/signin` - User signin page

### 4. Using the Auth System

#### In Components

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
   const { user, isAuthenticated, login, logout } = useAuth();

   // Use auth state and methods
}
```

#### Protected Routes

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

function MyPage() {
   return <ProtectedRoute>{/* Your protected content */}</ProtectedRoute>;
}

// For admin-only routes
function AdminPage() {
   return <ProtectedRoute requireAdmin>{/* Admin-only content */}</ProtectedRoute>;
}
```

#### Making Authenticated API Calls

```tsx
import axiosInstance from "@/lib/axiosInstance";

// Tokens are automatically included in cookies
const response = await axiosInstance.get("/some-endpoint");
```

## How It Works

### Token Flow

1. User logs in → Server generates access & refresh tokens → Tokens stored in HTTP-only cookies
2. Client makes API request → Access token automatically sent via cookies
3. If access token expires → Axios interceptor catches 401 → Automatically calls refresh endpoint → Retries original request
4. If refresh token expires → User redirected to signin page

### Authorization Flow

1. **Admin Login**: Admin enters password → Validated against `ADMIN_PASSWORD` env variable → Admin user created/retrieved → Tokens issued
2. **User Signup**: User enters details → Email checked against authorized emails in database → If authorized, user created with hashed password → Tokens issued
3. **User Signin**: User enters credentials → Email/password validated → Tokens issued

## Security Features

-  Passwords hashed with bcrypt (10 salt rounds)
-  JWT tokens with configurable expiry
-  HTTP-only cookies (prevents XSS attacks)
-  Secure cookies in production (HTTPS only)
-  SameSite cookie policy
-  Password field excluded from database queries by default
-  Automatic token refresh on expiry

## Testing the System

1. **Add an authorized email** (as admin):

   -  First, login as admin at `/admin/login`
   -  Use the existing API to add authorized emails

2. **Test user signup**:

   -  Go to `/signup`
   -  Try with unauthorized email (should fail)
   -  Try with authorized email (should succeed)

3. **Test user signin**:

   -  Go to `/signin`
   -  Enter credentials
   -  Should redirect to home page

4. **Test protected routes**:
   -  Try accessing a protected page without auth (should redirect to signin)
   -  Login and access the same page (should work)

## Next Steps

-  Add password reset functionality
-  Add email verification
-  Add rate limiting for login attempts
-  Add session management (view active sessions, logout all devices)
-  Add user profile management
