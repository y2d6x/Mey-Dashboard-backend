# Mey Account Dashboard - Backend API

A production-ready NestJS backend API with comprehensive security features for the Mey Account Dashboard.

## 🚀 Features

- **Complete Authentication System**: JWT-based auth with access and refresh tokens
- **Production-Grade Security**: Helmet, CORS, rate limiting, input validation
- **Swagger/OpenAPI Documentation**: Interactive API documentation with try-it-out functionality
- **MongoDB Integration**: Mongoose ODM with secure schema design
- **Password Security**: Bcrypt hashing with strong password policies
- **Token Management**: Automatic token rotation and secure storage
- **Comprehensive Validation**: Class-validator with DTO validation
- **Rate Limiting**: Configurable throttling to prevent abuse
- **API Versioning**: Clean `/api/v1` prefix structure

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally or remote instance)
- pnpm (recommended) or npm

## 🔧 Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Generate secure secrets for production!
```

## 🔐 Environment Setup

Generate secure secrets for production:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (use different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update your `.env` file with these values.

## 🏃 Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at: `http://localhost:3000/api/v1`

**Swagger Documentation**: `http://localhost:3000/api/docs`

## 📚 API Documentation

### Interactive Swagger UI
Visit `http://localhost:3000/api/docs` for interactive API documentation where you can:
- 🔍 Explore all available endpoints
- 📝 View request/response schemas
- 🧪 Test API calls directly from the browser
- 🔐 Authenticate and test protected routes

### API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Get Profile (Protected)
```http
GET /api/v1/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Refresh Access Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

#### Logout (Protected)
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Verify Token (Protected)
```http
GET /api/v1/auth/verify
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🛡️ Security Features

### Built-in Protection Against:
- ✅ SQL/NoSQL Injection
- ✅ Cross-Site Scripting (XSS)
- ✅ Cross-Site Request Forgery (CSRF)
- ✅ Brute Force Attacks
- ✅ DDoS Attacks
- ✅ JWT Token Theft
- ✅ Password Cracking
- ✅ Information Disclosure

### Rate Limiting:
- Global: 100 requests per 15 minutes
- Register: 3 requests per minute
- Login: 5 requests per minute
- Refresh: 10 requests per minute

### Token Expiration:
- Access Token: 15 minutes
- Refresh Token: 7 days

See [SECURITY.md](./SECURITY.md) for complete security documentation.

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📁 Project Structure

```
src/
├── auth/
│   ├── dto/              # Data Transfer Objects with validation
│   ├── guards/           # JWT authentication guards
│   ├── strategies/       # Passport JWT strategies
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── Schemas/          # MongoDB schemas
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── database/
│   └── database.module.ts
├── app.module.ts
└── main.ts
```

## 🔨 Development

```bash
# Format code
pnpm run format

# Lint code
pnpm run lint

# Build project
pnpm run build
```

## 🚀 Production Deployment

### Important Steps:
1. **Generate Strong Secrets**: Use cryptographically secure random strings
2. **Enable HTTPS**: Always use SSL/TLS certificates
3. **Set NODE_ENV**: Set to `production`
4. **Database Security**: Use strong passwords and restrict access
5. **Environment Variables**: Never commit `.env` to version control
6. **Update Dependencies**: Keep all packages up to date
7. **Enable Monitoring**: Set up logging and monitoring
8. **Configure Firewall**: Restrict unnecessary ports

### Production Environment Variables:
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-secure-production-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
MONGODB_URL=mongodb://user:pass@your-mongodb-host:27017/mey-dashboard
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `start` | Start the application |
| `start:dev` | Start in development mode with hot reload |
| `start:prod` | Start in production mode |
| `build` | Build the application |
| `format` | Format code with Prettier |
| `lint` | Lint code with ESLint |
| `test` | Run unit tests |
| `test:e2e` | Run end-to-end tests |
| `test:cov` | Generate test coverage report |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (Mac with Homebrew)
brew services start mongodb-community
```

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📞 Support

For security issues, please refer to [SECURITY.md](./SECURITY.md)

---

Built with ❤️ using [NestJS](https://nestjs.com/)
# Mey-Dashboard-backend
