# Swagger/OpenAPI Documentation Guide

## 📚 Accessing the Documentation

Once your server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## 🔐 Testing Protected Endpoints

### Step-by-Step Guide

1. **Register or Login**
   - Go to the Swagger UI
   - Expand the `POST /api/v1/auth/register` or `POST /api/v1/auth/login` endpoint
   - Click "Try it out"
   - Enter your credentials
   - Click "Execute"
   - Copy the `accessToken` from the response

2. **Authorize**
   - Click the green "Authorize" button at the top right
   - In the "Value" field, paste your access token (just the token, no "Bearer" prefix)
   - Click "Authorize"
   - Click "Close"

3. **Test Protected Routes**
   - Now you can test any protected endpoint (marked with a lock icon)
   - The authorization header will be automatically added

## 📝 Available Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user (protected)
- `POST /refresh` - Refresh access token
- `GET /profile` - Get user profile (protected)
- `GET /verify` - Verify token validity (protected)

### Users (`/api/v1/users`)
- `GET /me` - Get current user (protected)
- `GET /:id` - Get user by ID (protected)

## 🎯 Example: Complete Authentication Flow in Swagger

### 1. Register a New User
```json
POST /api/v1/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Use Access Token
Copy the `accessToken` and click "Authorize" button.

### 3. Test Protected Endpoint
```
GET /api/v1/auth/profile
```

The token is automatically included in the Authorization header.

### 4. Refresh Token
When your access token expires (after 15 minutes):
```json
POST /api/v1/auth/refresh
{
  "refreshToken": "your-refresh-token-here"
}
```

## 🛠️ Customization

### Adding New Endpoints
When creating new endpoints, use these decorators:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('your-module')
@Controller('your-module')
export class YourController {
  
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get item by ID',
    description: 'Retrieve a specific item by its ID',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiBearerAuth('JWT-auth') // If route is protected
  async findOne(@Param('id') id: string) {
    // implementation
  }
}
```

### Adding DTO Documentation
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    example: 'Item Name',
    description: 'The name of the item',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  name: string;
}
```

## 📊 Response Examples

All endpoints include example responses in the Swagger UI. Examples show:
- Success responses with sample data
- Error responses with status codes
- Required authentication tokens
- Rate limiting information

## 🔍 Schema Validation

Swagger automatically shows:
- Required fields (marked with a red asterisk)
- Field types (string, number, boolean, etc.)
- Validation rules (min/max length, patterns, etc.)
- Default values
- Example values

## 🚀 Production Considerations

### Disabling Swagger in Production
To disable Swagger in production, update `main.ts`:

```typescript
// Only enable Swagger in development
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    // ... configuration
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

### Securing Swagger
To add basic authentication to Swagger:

```typescript
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
  },
});
```

## 📖 Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

## 💡 Tips

1. **Persist Authorization**: The "persistAuthorization" option keeps your token between page refreshes
2. **Export OpenAPI Spec**: Download the JSON spec for use with other tools
3. **Test Errors**: Try invalid inputs to see error responses
4. **Rate Limiting**: Be aware of rate limits when testing multiple times
5. **Token Expiry**: Access tokens expire after 15 minutes - use refresh endpoint

## 🎨 Custom Styling

The Swagger UI includes custom styling to hide the top bar. Modify in `main.ts`:

```typescript
SwaggerModule.setup('api/docs', app, document, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your API Title',
});
```

---

Happy API Testing! 🚀

