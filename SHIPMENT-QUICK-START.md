# Shipment Management Quick Start Guide

## Prerequisites
Before you can use the shipment management system, ensure you have:
1. Backend server running (`npm run start:dev`)
2. MongoDB connected
3. An admin or super admin account created

## Step 1: Create an Admin Account

If you don't have an admin account yet, use the provided script:

```bash
node create-super-admin.js
```

Or manually create one through the API after logging in with your first super admin account.

## Step 2: Login as Admin

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mey.com",
    "password": "your-admin-password"
  }'
```

Save the `accessToken` from the response. You'll need it for all subsequent requests.

## Step 3: Create Your First Shipment

### Example: Shein Shipment

```bash
curl -X POST http://localhost:3000/admin/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "customerName": "Ahmed Ali",
    "customerPhone": "+964 770 123 4567",
    "customerAddress": {
      "street": "Al-Karrada Street, Building 15",
      "city": "Baghdad",
      "province": "Baghdad",
      "country": "Iraq"
    },
    "platform": "shein",
    "items": [
      {
        "name": "Summer Dress",
        "quantity": 2,
        "price": 15000
      },
      {
        "name": "Fashion Sandals",
        "quantity": 1,
        "price": 20000
      }
    ],
    "weight": 2.5
  }'
```

**What happens automatically:**
- ✅ Tracking number generated: `MEY-SHEIN-XXXXXXXXX`
- ✅ Cart price calculated: 50,000 IQD (from items)
- ✅ Shipment fee calculated: 6,500 IQD (weight-based)
- ✅ Delivery fee added: 5,000 IQD
- ✅ Total price: 61,500 IQD
- ✅ Status set to: `pending`

## Step 4: View All Shipments

```bash
curl -X GET http://localhost:3000/admin/shipments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Filter by Status

```bash
curl -X GET "http://localhost:3000/admin/shipments?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search by Customer Name

```bash
curl -X GET "http://localhost:3000/admin/shipments?search=Ahmed" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 5: Update Shipment Status

```bash
curl -X PATCH http://localhost:3000/admin/shipments/SHIPMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "confirmed",
    "notes": "Order confirmed and ready for packing"
  }'
```

### Status Workflow

1. `pending` → Customer placed order
2. `confirmed` → Order confirmed by admin
3. `packed` → Items packed and ready
4. `shipped` → Handed to carrier
5. `in_transit` → On the way
6. `out_for_delivery` → Out for final delivery
7. `delivered` → Successfully delivered

## Step 6: Calculate Price Preview

Before creating a shipment, you can preview the price:

```bash
curl -X POST http://localhost:3000/admin/shipments/calculate-price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "platform": "shein",
    "cartPrice": 50000,
    "weight": 2.5,
    "materialCost": 5000
  }'
```

Response:
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

## Step 7: View Shipment Statistics

```bash
curl -X GET http://localhost:3000/admin/shipments/statistics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Scenarios

### Creating Shipment with Manual Price

If you need to set a custom price (discount, special offer, etc.):

```bash
curl -X POST http://localhost:3000/admin/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "customerName": "Sara Mohammed",
    "customerPhone": "+964 771 999 8888",
    "customerAddress": {
      "street": "Main Street 10",
      "city": "Erbil",
      "province": "Erbil",
      "country": "Iraq"
    },
    "platform": "amazon",
    "items": [{"name": "Electronics", "quantity": 1, "price": 100000}],
    "weight": 3.0,
    "priceOverride": true,
    "cartPrice": 100000,
    "shipmentFee": 8000,
    "materialCost": 5000,
    "deliveryFee": 5000,
    "totalPrice": 115000
  }'
```

### Linking to Registered User

If the customer has an account in your system:

```json
{
  "userId": "USER_MONGO_ID",
  "customerName": "Ahmed Ali",
  ...
}
```

### Adding Package Dimensions

```json
{
  ...
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 10,
    "unit": "cm"
  }
}
```

### Setting Estimated Delivery Date

```json
{
  ...
  "estimatedDeliveryDate": "2025-10-25"
}
```

### Marking as Delivered

```bash
curl -X PATCH http://localhost:3000/admin/shipments/SHIPMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "delivered",
    "actualDeliveryDate": "2025-10-24",
    "notes": "Delivered successfully to customer"
  }'
```

## Platform-Specific Pricing

### Shein
- Base fee: 6,500 IQD
- Extra: +1,000 IQD per kg over 5kg
- Delivery: 5,000 IQD

### Amazon
- Base fee: 7,000 IQD
- Extra: +1,200 IQD per kg over 5kg
- Delivery: 5,000 IQD

### Sheglam
- Base fee: 6,000 IQD
- Extra: +1,000 IQD per kg over 5kg
- Delivery: 5,000 IQD

## Using Swagger UI

For a better experience, use the interactive Swagger UI:

1. Open browser: `http://localhost:3000/api`
2. Click "Authorize" button
3. Enter: `Bearer YOUR_ACCESS_TOKEN`
4. Click "Authorize"
5. Now you can test all endpoints with a nice UI!

## Filter Examples

### By Date Range
```
GET /admin/shipments?startDate=2025-10-01&endDate=2025-10-31
```

### By Platform and Status
```
GET /admin/shipments?platform=shein&status=shipped
```

### Search with Multiple Filters
```
GET /admin/shipments?platform=amazon&status=in_transit&search=Ahmed
```

## Tips

1. **Always use status updates** - Keep customers informed by updating shipment status
2. **Use internal notes** - Track important details that customers shouldn't see
3. **Check price preview** - Use calculate-price endpoint before creating shipments
4. **Search is powerful** - Search works on tracking number, customer name, and phone
5. **Track statistics** - Monitor your business with the statistics endpoint

## Need Help?

- Full Documentation: See [SHIPMENT-MANAGEMENT.md](./SHIPMENT-MANAGEMENT.md)
- API Reference: Visit `http://localhost:3000/api`
- Security: See [SECURITY.md](./SECURITY.md)

## Next Steps

1. Create shipments for different platforms (Amazon, Sheglam)
2. Test the status workflow from pending to delivered
3. Try filtering and searching
4. Check out the statistics endpoint
5. Integrate with your frontend application

Happy shipping! 🚀

