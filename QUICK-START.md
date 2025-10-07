# 🚀 Quick Start Guide

Get your API up and running in 5 minutes!

## Step 1: Install Dependencies ✅

Already done! Your dependencies are installed.

## Step 2: Start MongoDB 🍃

```bash
# Check if MongoDB is running
mongosh

# If not running, start it (macOS with Homebrew)
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 3: Start the Server 🚀

```bash
cd /Users/y2d6x/Mey/mey-account-dashboard-backend
pnpm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000/api/v1
📚 API Documentation: http://localhost:3000/api/docs
🌍 Environment: development
🔒 Security features enabled
```

## Step 4: Test the API 🧪

### Option 1: Use Swagger UI (Recommended)

1. Open browser: http://localhost:3000/api/docs
2. Try the "Register" endpoint:
   - Click on `POST /api/v1/auth/register`
   - Click "Try it out"
   - Use example data or modify:
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "SecureP@ss123"
     }
     ```
   - Click "Execute"
   - Copy the `accessToken` from response

3. Authorize protected endpoints:
   - Click the green "Authorize" button (top right)
   - Paste your access token
   - Click "Authorize" then "Close"

4. Test protected endpoints:
   - Try `GET /api/v1/auth/profile`
   - Click "Try it out" → "Execute"

### Option 2: Use cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecureP@ss123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureP@ss123"
  }'

# Use the accessToken from response:
export TOKEN="your-access-token-here"

# Get Profile
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3: Use Postman

1. Import OpenAPI spec from: http://localhost:3000/api/docs-json
2. Set up an environment variable for your token
3. Add to request headers: `Authorization: Bearer {{token}}`

## Step 5: Connect Your Frontend 🌐

Update your frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

Example frontend code:
```typescript
// Login function
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// Protected API call
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response.json();
};
```

## Common Issues & Solutions 🔧

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB
```bash
brew services start mongodb-community
# or
docker start mongodb
```

### Port 3000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill the process or change the port
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### JWT Secret Not Set
```
Error: JWT secret not configured
```
**Solution**: Check your `.env` file has `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Rate Limit Exceeded
```
Error: 429 Too Many Requests
```
**Solution**: Wait a minute or adjust rate limits in `app.module.ts`

## Next Steps 📚

1. ✅ Read full documentation: [README.md](./README.md)
2. ✅ Learn about security features: [SECURITY.md](./SECURITY.md)
3. ✅ Explore Swagger UI: http://localhost:3000/api/docs
4. ✅ Check Swagger guide: [SWAGGER.md](./SWAGGER.md)
5. ✅ Build your custom endpoints!

## Quick Reference 📖

| Resource | URL |
|----------|-----|
| API Base | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api/docs |
| OpenAPI JSON | http://localhost:3000/api/docs-json |

## Development Tips 💡

1. **Hot Reload**: Save files and server restarts automatically
2. **View Logs**: Watch terminal for request logs and errors
3. **Test Security**: Try invalid tokens/passwords to see error handling
4. **MongoDB GUI**: Use MongoDB Compass for database visualization
5. **Postman Collection**: Export from Swagger for team sharing

---

**You're all set!** 🎉

Need help? Check the docs or open an issue.

