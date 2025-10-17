# Shipment Management System Documentation

## Overview

The Shipment Management System for Mey allows administrators to manage shipments from various platforms (Shein, Amazon, Sheglam, and others). The system includes automatic pricing calculations, status tracking, and comprehensive filtering capabilities.

## Features

- ✅ Full CRUD operations for shipments
- ✅ Automatic price calculation based on platform and weight
- ✅ Manual price override capability
- ✅ Support for both registered users and guest customers
- ✅ Status workflow tracking (9 different statuses)
- ✅ Multiple platform support (Shein, Amazon, Sheglam, Other)
- ✅ Comprehensive filtering and search
- ✅ Statistics and analytics
- ✅ Role-based access control (Admin and Super Admin only)
- ✅ Rate limiting and throttling
- ✅ Full Swagger/OpenAPI documentation

## Access Control

All shipment endpoints require authentication and admin privileges:
- **Admin**: Can create, view, update shipments and change status
- **Super Admin**: Has all admin permissions plus ability to delete shipments

## API Endpoints

Base URL: `/admin/shipments`

### 1. Create Shipment
**POST** `/admin/shipments`

Creates a new shipment with automatic tracking number generation and price calculation.

**Request Body:**
```json
{
  "customerName": "Ahmed Ali",
  "customerPhone": "+964 770 123 4567",
  "customerAddress": {
    "street": "Al-Karrada Street, Building 15",
    "city": "Baghdad",
    "province": "Baghdad",
    "postalCode": "10001",
    "country": "Iraq"
  },
  "userId": "507f1f77bcf86cd799439011",  // Optional - if customer is registered
  "platform": "shein",
  "items": [
    {
      "name": "Summer Dress",
      "quantity": 2,
      "price": 15000
    },
    {
      "name": "Sandals",
      "quantity": 1,
      "price": 20000
    }
  ],
  "weight": 2.5,
  "dimensions": {  // Optional
    "length": 30,
    "width": 20,
    "height": 10,
    "unit": "cm"
  },
  "carrier": "DHL",  // Optional
  "estimatedDeliveryDate": "2025-10-25",  // Optional
  "notes": "Handle with care",  // Optional
  "internalNotes": "Priority shipment"  // Optional
}
```

**Auto-calculated Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "trackingNumber": "MEY-SHEIN-123456789",
  "customerName": "Ahmed Ali",
  "customerPhone": "+964 770 123 4567",
  "customerAddress": { ... },
  "userId": "507f1f77bcf86cd799439011",
  "platform": "shein",
  "items": [ ... ],
  "weight": 2.5,
  "pricing": {
    "cartPrice": 50000,
    "shipmentFee": 6500,
    "materialCost": 0,
    "deliveryFee": 5000,
    "totalPrice": 61500,
    "priceOverride": false
  },
  "status": "pending",
  "createdAt": "2025-10-17T10:00:00.000Z",
  "updatedAt": "2025-10-17T10:00:00.000Z"
}
```

**Manual Price Override:**
To manually set the price, include `priceOverride: true` and `totalPrice`:
```json
{
  // ... other fields
  "priceOverride": true,
  "totalPrice": 70000,
  "cartPrice": 50000,
  "shipmentFee": 8000,
  "materialCost": 7000,
  "deliveryFee": 5000
}
```

### 2. Get All Shipments
**GET** `/admin/shipments`

Retrieve all shipments with optional filters.

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, packed, shipped, in_transit, out_for_delivery, delivered, cancelled, returned)
- `platform` - Filter by platform (shein, amazon, sheglam, other)
- `userId` - Filter by user ID
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `search` - Search by tracking number, customer name, or phone

**Examples:**
```
GET /admin/shipments?status=pending
GET /admin/shipments?platform=shein&status=shipped
GET /admin/shipments?search=Ahmed
GET /admin/shipments?startDate=2025-10-01&endDate=2025-10-31
```

### 3. Get Shipment by ID
**GET** `/admin/shipments/:id`

Retrieve a specific shipment by its MongoDB ID.

### 4. Get Shipment by Tracking Number
**GET** `/admin/shipments/tracking/:trackingNumber`

Retrieve a shipment by its tracking number.

**Example:**
```
GET /admin/shipments/tracking/MEY-SHEIN-123456789
```

### 5. Update Shipment
**PATCH** `/admin/shipments/:id`

Update any shipment fields. Pricing will be recalculated automatically unless `priceOverride` is true.

**Request Body (partial update):**
```json
{
  "weight": 3.0,
  "carrier": "FedEx",
  "notes": "Customer requested faster delivery"
}
```

### 6. Update Shipment Status
**PATCH** `/admin/shipments/:id/status`

Update the status of a shipment with optional notes.

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Picked up by carrier at 2:00 PM",
  "actualDeliveryDate": "2025-10-25"  // Only for delivered status
}
```

**Status Flow:**
```
pending → confirmed → packed → shipped → in_transit → out_for_delivery → delivered
                                                    ↘
                                                      cancelled / returned
```

### 7. Delete Shipment (Super Admin Only)
**DELETE** `/admin/shipments/:id`

Permanently delete a shipment. Only super admins can perform this action.

### 8. Calculate Price
**POST** `/admin/shipments/calculate-price`

Calculate the price for a shipment without creating it. Useful for price previews.

**Request Body:**
```json
{
  "platform": "shein",
  "cartPrice": 50000,
  "weight": 2.5,
  "materialCost": 5000,  // Optional
  "deliveryFee": 5000     // Optional, defaults to 5000
}
```

**Response:**
```json
{
  "cartPrice": 50000,
  "shipmentFee": 6500,
  "materialCost": 5000,
  "deliveryFee": 5000,
  "totalPrice": 66500,
  "platform": "shein",
  "weight": 2.5
}
```

### 9. Get Statistics
**GET** `/admin/shipments/statistics`

Get shipment statistics including total shipments, revenue, and counts by status/platform.

**Response:**
```json
{
  "totalShipments": 156,
  "byStatus": [
    { "_id": "pending", "count": 23 },
    { "_id": "shipped", "count": 45 },
    { "_id": "delivered", "count": 78 }
  ],
  "byPlatform": [
    { "_id": "shein", "count": 89 },
    { "_id": "amazon", "count": 45 },
    { "_id": "sheglam", "count": 22 }
  ],
  "totalRevenue": 12450000
}
```

## Pricing Logic

### Shein Platform
- **Base shipment fee**: 6,500 IQD
- **Weight surcharge**: +1,000 IQD per kg over 5 kg
- **Formula**: `totalPrice = cartPrice + shipmentFee + materialCost + deliveryFee`

**Example:**
- Cart Price: 50,000 IQD (items from Shein at original price)
- Weight: 2.5 kg → Shipment Fee: 6,500 IQD
- Material Cost: 5,000 IQD (packaging)
- Delivery Fee: 5,000 IQD (fixed)
- **Total: 66,500 IQD**

### Amazon Platform
- **Base shipment fee**: 7,000 IQD
- **Weight surcharge**: +1,200 IQD per kg over 5 kg

### Sheglam Platform
- **Base shipment fee**: 6,000 IQD
- **Weight surcharge**: +1,000 IQD per kg over 5 kg

### Other Platforms
- **Base shipment fee**: 6,500 IQD
- **Weight surcharge**: +1,000 IQD per kg over 5 kg

### Manual Price Override
To manually set prices (for special cases, discounts, etc.):
1. Set `priceOverride: true`
2. Provide all pricing fields: `cartPrice`, `shipmentFee`, `materialCost`, `deliveryFee`, `totalPrice`
3. The system will not recalculate prices on updates

## Shipment Statuses

| Status | Description |
|--------|-------------|
| **pending** | Initial state, order received |
| **confirmed** | Order confirmed, ready for processing |
| **packed** | Items packed and ready for shipment |
| **shipped** | Handed over to carrier |
| **in_transit** | In transit to destination |
| **out_for_delivery** | Out for final delivery |
| **delivered** | Successfully delivered to customer |
| **cancelled** | Shipment cancelled |
| **returned** | Shipment returned |

## Customer Types

The system supports two types of customers:

### 1. Registered Customers
- Have a `userId` linked to the User collection
- Can view their shipments through the system
- Customer info can be pre-filled from user profile

### 2. Guest Customers
- No `userId` field
- Customer info stored directly in shipment
- Standalone records for tracking

## Tracking Numbers

Tracking numbers are automatically generated in the format:
```
MEY-{PLATFORM}-{TIMESTAMP}{RANDOM}
```

Examples:
- `MEY-SHEIN-123456789`
- `MEY-AMAZON-987654321`
- `MEY-SHEGLAM-456789123`

## Authentication

All endpoints require JWT authentication with Admin or Super Admin role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

Get your token from the `/admin/auth/login` endpoint.

## Rate Limiting

- **Create shipment**: 20 requests per minute
- **Update shipment**: 30 requests per minute
- **Update status**: 50 requests per minute
- **Delete shipment**: 10 requests per minute
- **Other endpoints**: 100 requests per 15 minutes (global)

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid shipment ID",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Shipment not found",
  "error": "Not Found"
}
```

## Swagger Documentation

Full interactive API documentation is available at:
```
http://localhost:3000/api
```

## Database Schema

### Shipment Collection
```typescript
{
  trackingNumber: string (unique)
  customerName: string
  customerPhone: string
  customerAddress: {
    street: string
    city: string
    province: string
    postalCode?: string
    country: string
  }
  userId?: ObjectId (ref: User)
  platform: 'shein' | 'amazon' | 'sheglam' | 'other'
  items: [{
    name: string
    quantity: number
    price: number
  }]
  weight: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }
  pricing: {
    cartPrice: number
    shipmentFee: number
    materialCost: number
    deliveryFee: number
    totalPrice: number
    priceOverride: boolean
  }
  status: ShipmentStatus
  carrier?: string
  estimatedDeliveryDate?: Date
  actualDeliveryDate?: Date
  notes?: string
  internalNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Future Enhancements

The system is designed to be easily extensible for:
- Additional platforms with custom pricing
- Shipment tracking history/timeline
- Customer notifications (email/SMS)
- Reporting and analytics dashboard
- Bulk operations
- CSV import/export
- Integration with carrier APIs

## Testing the API

### Example: Create a Shein Shipment

1. **Login as Admin:**
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mey.com",
    "password": "your-password"
  }'
```

2. **Create Shipment:**
```bash
curl -X POST http://localhost:3000/admin/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "Ahmed Ali",
    "customerPhone": "+964 770 123 4567",
    "customerAddress": {
      "street": "Al-Karrada Street",
      "city": "Baghdad",
      "province": "Baghdad",
      "country": "Iraq"
    },
    "platform": "shein",
    "items": [
      { "name": "Summer Dress", "quantity": 2, "price": 15000 }
    ],
    "weight": 2.5
  }'
```

3. **Get All Shipments:**
```bash
curl -X GET http://localhost:3000/admin/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Update Status:**
```bash
curl -X PATCH http://localhost:3000/admin/shipments/SHIPMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "shipped",
    "notes": "Package shipped with DHL"
  }'
```

## Support

For issues or questions, please refer to the project README or contact the development team.

