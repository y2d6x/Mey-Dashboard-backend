# Admin Authentication System Guide

Complete guide for the admin authentication system with role-based access control.

## 📋 Table of Contents
- [Overview](#overview)
- [User Roles](#user-roles)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Security Features](#security-features)

## 🎯 Overview

The admin authentication system provides:
- **Role-Based Access Control (RBAC)**: Three levels of access
- **Separate Admin Login**: Dedicated admin endpoints
- **User Management**: Admin panel capabilities
- **Enhanced Security**: Longer session times for admins

## 👥 User Roles

### 1. **User** (Default)
- Register and login
- Access personal profile
- Standard user permissions

### 2. **Admin**
- All user permissions
- View all users
- Access admin dashboard
- Cannot create other admins
- Cannot delete users

### 3. **Super Admin**
- All admin permissions
- Create new admins
- Delete any user
- Update user roles
- Full system access

## 🚀 Quick Start

### Step 1: Create First Super Admin

```bash
cd /Users/y2d6x/Mey/mey-account-dashboard-backend

# Run the super admin creation script
node create-super-admin.js
```

Follow the prompts:
```
Username: super_admin
Email: admin@mey.com
Password: SuperAdmin@123
```

### Step 2: Start the Server

```bash
pnpm run start:dev
```

### Step 3: Login as Admin

**Using Swagger UI:**
1. Go to http://localhost:3000/api/docs
2. Find `POST /api/v1/admin/auth/login`
3. Use your super admin credentials
4. Copy the `accessToken`
5. Click "Authorize" and paste token

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mey.com",
    "password": "SuperAdmin@123"
  }'
```

## 📚 API Endpoints

### Admin Authentication (`/api/v1/admin/auth`)

#### 1. Admin Login
```http
POST /api/v1/admin/auth/login
```

**Body:**
```json
{
  "email": "admin@mey.com",
  "password": "AdminP@ss123"
}
```

**Response:**
```json
{
  "admin": {
    "_id": "...",
    "username": "admin_user",
    "email": "admin@mey.com",
    "role": "admin"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Access:** Public (but requires admin role in database)

---

#### 2. Get Admin Profile
```http
GET /api/v1/admin/auth/profile
Authorization: Bearer {accessToken}
```

**Access:** Admin, Super Admin

---

#### 3. Create New Admin
```http
POST /api/v1/admin/auth/create-admin
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "username": "new_admin",
  "email": "newadmin@mey.com",
  "password": "SecureP@ss123",
  "role": "admin"
}
```

**Access:** Super Admin only

---

#### 4. Get All Users
```http
GET /api/v1/admin/auth/users
Authorization: Bearer {accessToken}
```

**Response:**
```json
[
  {
    "_id": "...",
    "username": "user1",
    "email": "user1@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

**Access:** Admin, Super Admin

---

#### 5. Delete User
```http
DELETE /api/v1/admin/auth/users/{userId}
Authorization: Bearer {accessToken}
```

**Access:** Super Admin only

---

#### 6. Update User Role
```http
PATCH /api/v1/admin/auth/users/{userId}/role
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "role": "admin"
}
```

**Access:** Super Admin only

---

## 💡 Usage Examples

### Example 1: Create Multiple Admins

```bash
# 1. Login as super admin
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mey.com",
    "password": "SuperAdmin@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 2. Create new admin
curl -X POST http://localhost:3000/api/v1/admin/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "support_admin",
    "email": "support@mey.com",
    "password": "SecureP@ss123",
    "role": "admin"
  }'
```

### Example 2: Promote User to Admin

```bash
# Get user ID from users list
curl -X GET http://localhost:3000/api/v1/admin/auth/users \
  -H "Authorization: Bearer $TOKEN"

# Update user role
curl -X PATCH http://localhost:3000/api/v1/admin/auth/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "role": "admin"
  }'
```

### Example 3: View All Users (Admin Dashboard)

```bash
curl -X GET http://localhost:3000/api/v1/admin/auth/users \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Example 4: Remove User (Super Admin)

```bash
curl -X DELETE http://localhost:3000/api/v1/admin/auth/users/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 🔒 Security Features

### 1. **Role Verification**
- Every admin endpoint verifies user role from database
- Tokens include role information
- Role checked on each request

### 2. **Extended Session**
- Admin access tokens: 1 hour (vs 15 min for users)
- Refresh tokens: 7 days
- Secure token rotation

### 3. **Permission Hierarchy**
```
Super Admin > Admin > User
```

### 4. **Protected Actions**
- Create admin: Super Admin only
- Delete user: Super Admin only
- Update role: Super Admin only
- View users: Admin & Super Admin

### 5. **Rate Limiting**
- Admin login: 5 requests/minute
- Create admin: 3 requests/minute
- Prevents brute force attacks

## 📊 Role Comparison

| Action | User | Admin | Super Admin |
|--------|------|-------|-------------|
| Register/Login | ✅ | ✅ | ✅ |
| Own Profile | ✅ | ✅ | ✅ |
| View All Users | ❌ | ✅ | ✅ |
| Create Admin | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |
| Update Role | ❌ | ❌ | ✅ |

## 🛡️ Best Practices

### 1. **Super Admin Security**
- Keep super admin credentials secure
- Use strong, unique passwords
- Limit number of super admin accounts
- Regularly audit admin actions

### 2. **Admin Account Management**
- Create specific admins for different purposes
- Use descriptive usernames (e.g., `support_admin`)
- Remove admin access when no longer needed
- Regular password rotation

### 3. **Token Management**
- Store tokens securely (httpOnly cookies recommended)
- Clear tokens on logout
- Implement token refresh flow
- Monitor for suspicious activity

### 4. **Database Security**
- Role field is enum-validated
- Default role is 'user'
- Only super admin can create other admins
- Mongoose prevents NoSQL injection

## 🔍 Monitoring & Logs

Track these admin actions:
- Admin logins
- User deletions
- Role changes
- Admin account creations

## 🚨 Troubleshooting

### "Access denied - Admin privileges required"
- User trying to access admin endpoint
- Solution: Login with admin credentials

### "Only super admins can create admin accounts"
- Regular admin trying to create another admin
- Solution: Use super admin account

### "Forbidden - Super admin privileges required"
- Admin trying super admin action
- Solution: Contact super admin

## 📖 Integration with Frontend

### Admin Login Component
```typescript
const adminLogin = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials or not an admin');
  }
  
  const data = await response.json();
  localStorage.setItem('adminToken', data.accessToken);
  return data.admin;
};
```

### Protected Admin Route
```typescript
const fetchUsers = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('http://localhost:3000/api/v1/admin/auth/users', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response.json();
};
```

---

## 📞 Support

For issues or questions about the admin system:
- Check [SECURITY.md](./SECURITY.md) for security features
- Check [SWAGGER.md](./SWAGGER.md) for API documentation
- Review logs for error messages

---

**Built with security and scalability in mind** 🔐

