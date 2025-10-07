# Security Features

This API implements production-ready security features to protect against common vulnerabilities.

## 🔒 Implemented Security Features

### 1. Authentication & Authorization
- **JWT Access Tokens**: Short-lived (15 minutes) for API access
- **JWT Refresh Tokens**: Long-lived (7 days) for token renewal
- **Bcrypt Password Hashing**: Using salt rounds of 12 for strong password protection
- **Token Rotation**: Refresh tokens are rotated on each use
- **Secure Token Storage**: Refresh tokens are hashed before storing in database

### 2. Input Validation & Sanitization
- **Class Validator**: Automatic DTO validation with decorators
- **Whitelist Mode**: Strips unknown properties from requests
- **Transform Mode**: Safely transforms input to expected types
- **Strong Password Policy**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### 3. Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Endpoints**:
  - Register: 3 requests per minute
  - Login: 5 requests per minute
  - Refresh: 10 requests per minute
- **Protected Endpoints**: Skip rate limiting (profile, verify)

### 4. HTTP Security Headers (Helmet)
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HSTS)
- X-DNS-Prefetch-Control

### 5. CORS Protection
- Whitelist-based origin validation
- Credentials support for authenticated requests
- Controlled HTTP methods and headers

### 6. Database Security
- **MongoDB**: Connection string validation
- **Query Sanitization**: Mongoose prevents NoSQL injection
- **Unique Constraints**: Email and username uniqueness enforced
- **No Plain Text Storage**: All sensitive data is hashed

### 7. Error Handling
- **Generic Error Messages**: No sensitive data in production errors
- **Detailed Validation Errors**: Only in development mode
- **Consistent Error Format**: Standardized error responses

### 8. Additional Security Measures
- **Compression**: Response compression enabled
- **Cookie Parser**: Secure cookie handling
- **Shutdown Hooks**: Graceful shutdown handling
- **Environment Variables**: All secrets in .env file
- **API Versioning**: `/api/v1` prefix for future compatibility

## 🚀 Environment Variables

Required environment variables for security:

```bash
# JWT Secrets - Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<different-64-character-random-string>

# Database
MONGODB_URL=mongodb://localhost:27017/mey-dashboard

# CORS
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
NODE_ENV=production
```

## 🛡️ API Endpoints

### Public Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Protected Endpoints (Require JWT)
- `GET /api/v1/auth/profile` - Get user profile
- `GET /api/v1/auth/verify` - Verify token validity
- `POST /api/v1/auth/logout` - Logout and invalidate refresh token

## 📝 Usage Examples

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Security Best Practices

### For Production Deployment
1. **Use HTTPS**: Always use SSL/TLS certificates
2. **Strong Secrets**: Generate cryptographically secure random secrets
3. **Environment Variables**: Never commit `.env` file to version control
4. **Database Security**: Use strong database passwords and restrict access
5. **Regular Updates**: Keep all dependencies updated
6. **Monitoring**: Implement logging and monitoring for security events
7. **Backup**: Regular database backups
8. **Firewall**: Configure firewall rules to restrict access

### Password Security
- Passwords are hashed with bcrypt (12 salt rounds)
- Never stored in plain text
- Strong password policy enforced
- Rate limiting prevents brute force attacks

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are invalidated on logout
- Refresh tokens are rotated on each use
- Refresh tokens are hashed in database

## 🚨 Common Security Issues Prevented

✅ SQL/NoSQL Injection  
✅ Cross-Site Scripting (XSS)  
✅ Cross-Site Request Forgery (CSRF)  
✅ Brute Force Attacks  
✅ DDoS Attacks (via rate limiting)  
✅ JWT Token Theft (short expiration)  
✅ Password Cracking (bcrypt + strong policy)  
✅ Information Disclosure  
✅ Broken Authentication  
✅ Security Misconfiguration  

## 📞 Security Contact

If you discover a security vulnerability, please report it immediately.

## 📜 License

All security measures are implemented following OWASP guidelines and industry best practices.

