# Platform Pricing Configuration

## الأسعار حسب المنصة

تم تهيئة النظام بحيث كل منصة (Platform) لها أسعارها الخاصة.

### 📊 جدول الأسعار

| المنصة | السعر لكل كيلو | رسوم التوصيل |
|--------|---------------|-------------|
| **Shein** (شي ان) | 6,500 IQD | 5,000 IQD |
| **Amazon** (أمازون) | 8,000 IQD | 5,000 IQD |
| **Sheglam** (شي جلام) | 5,500 IQD | 5,000 IQD |
| **Other** (أخرى) | 7,000 IQD | 5,000 IQD |

---

## 🔢 كيف يتم حساب السعر؟

### الصيغة العامة:
```
السعر الكلي = سعر السلة + رسوم الشحن + تكلفة التغليف + رسوم التوصيل
```

### رسوم الشحن تُحسب كالتالي:
```
رسوم الشحن = الوزن (كيلو) × السعر لكل كيلو
```

**مثال:**
- 5 كيلو من Shein = 5 × 6,500 = 32,500 IQD
- 3 كيلو من Amazon = 3 × 8,000 = 24,000 IQD
- 2 كيلو من Sheglam = 2 × 5,500 = 11,000 IQD

---

## 💡 أمثلة حسابية

### مثال 1: شحنة من Shein (5 كيلو)
```
سعر السلة: 50,000 IQD
الوزن: 5 كجم
تكلفة التغليف: 0 IQD

الحساب:
- رسوم الشحن = 5 × 6,500 = 32,500 IQD
- رسوم التوصيل = 5,000 IQD
- السعر الكلي = 50,000 + 32,500 + 0 + 5,000 = 87,500 IQD
```

### مثال 2: شحنة من Shein (3 كيلو)
```
سعر السلة: 30,000 IQD
الوزن: 3 كجم
تكلفة التغليف: 2,000 IQD

الحساب:
- رسوم الشحن = 3 × 6,500 = 19,500 IQD
- رسوم التوصيل = 5,000 IQD
- السعر الكلي = 30,000 + 19,500 + 2,000 + 5,000 = 56,500 IQD
```

### مثال 3: شحنة من Amazon (5 كيلو)
```
سعر السلة: 100,000 IQD
الوزن: 5 كجم
تكلفة التغليف: 3,000 IQD

الحساب:
- رسوم الشحن = 5 × 8,000 = 40,000 IQD
- رسوم التوصيل = 5,000 IQD
- السعر الكلي = 100,000 + 40,000 + 3,000 + 5,000 = 148,000 IQD
```

### مثال 4: شحنة من Sheglam (2 كيلو - الأرخص)
```
سعر السلة: 40,000 IQD
الوزن: 2 كجم
تكلفة التغليف: 0 IQD

الحساب:
- رسوم الشحن = 2 × 5,500 = 11,000 IQD
- رسوم التوصيل = 5,000 IQD
- السعر الكلي = 40,000 + 11,000 + 0 + 5,000 = 56,000 IQD
```

### مثال 5: شحنة من Other (10 كيلو)
```
سعر السلة: 80,000 IQD
الوزن: 10 كجم
تكلفة التغليف: 5,000 IQD

الحساب:
- رسوم الشحن = 10 × 7,000 = 70,000 IQD
- رسوم التوصيل = 5,000 IQD
- السعر الكلي = 80,000 + 70,000 + 5,000 + 5,000 = 160,000 IQD
```

---

## 🌐 API Endpoint

### الحصول على أسعار جميع المنصات
```http
GET /admin/shipments/pricing
Authorization: Bearer <token>
```

#### Response:
```json
{
  "shein": {
    "pricePerKg": 6500,
    "defaultDeliveryFee": 5000,
    "defaultMaterialCost": 0,
    "currency": "IQD"
  },
  "amazon": {
    "pricePerKg": 8000,
    "defaultDeliveryFee": 5000,
    "defaultMaterialCost": 0,
    "currency": "IQD"
  },
  "sheglam": {
    "pricePerKg": 5500,
    "defaultDeliveryFee": 5000,
    "defaultMaterialCost": 0,
    "currency": "IQD"
  },
  "other": {
    "pricePerKg": 7000,
    "defaultDeliveryFee": 5000,
    "defaultMaterialCost": 0,
    "currency": "IQD"
  }
}
```

### حساب السعر لشحنة معينة
```http
POST /admin/shipments/calculate-price
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "shein",
  "cartPrice": 50000,
  "weight": 3,
  "materialCost": 2000,
  "deliveryFee": 5000
}
```

#### Response:
```json
{
  "cartPrice": 50000,
  "shipmentFee": 6500,
  "materialCost": 2000,
  "deliveryFee": 5000,
  "totalPrice": 63500,
  "platform": "shein",
  "weight": 3
}
```

---

## ⚙️ كيفية تعديل الأسعار

لتعديل الأسعار، قم بتحرير ملف:
```
src/admin/shipments/shipments.service.ts
```

ابحث عن `PLATFORM_PRICING` وقم بتعديل القيم:

```typescript
const PLATFORM_PRICING: Record<ShipmentPlatform, PlatformPricingConfig> = {
  [ShipmentPlatform.SHEIN]: {
    pricePerKg: 6500,          // السعر لكل كيلو - عدل هنا
    defaultDeliveryFee: 5000,  // رسوم التوصيل - عدل هنا
    defaultMaterialCost: 0,    // تكلفة التغليف
    currency: 'IQD',
  },
  // ... باقي المنصات
};
```

بعد التعديل:
```bash
npm run build
npm run start:dev
```

---

## 📱 استخدام الأسعار في Frontend

```typescript
// جلب أسعار جميع المنصات
const response = await fetch('http://localhost:3000/admin/shipments/pricing', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const pricing = await response.json();

// عرض أسعار Shein
console.log('Shein base fee:', pricing.shein.baseShipmentFee); // 6500
console.log('Shein delivery:', pricing.shein.defaultDeliveryFee); // 5000

// حساب السعر لشحنة معينة
const priceCalc = await fetch('http://localhost:3000/admin/shipments/calculate-price', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    platform: 'shein',
    cartPrice: 50000,
    weight: 3,
    materialCost: 2000
  })
});
const result = await priceCalc.json();
console.log('Total:', result.totalPrice); // 63500
```

---

## 📝 ملاحظات مهمة

1. **جميع الأسعار بالدينار العراقي (IQD)**
2. **رسوم التوصيل ثابتة** لجميع المنصات (5,000 IQD)
3. **الوزن يُحسب بالكيلوجرام**
4. **الوزن الزائد يُقرب لأعلى رقم صحيح** (مثلاً: 5.3 كجم = 6 كجم)
5. **تكلفة التغليف اختيارية** ويمكن تركها 0 إذا لم تكن مطلوبة
6. **يمكن تجاوز الحساب التلقائي** عن طريق تفعيل `priceOverride` في API

---

## 🔄 المقارنة بين المنصات

### الأرخص ← الأغلى (لكل كيلو):
1. 🥇 **Sheglam**: 5,500 IQD/كجم (الأرخص)
2. 🥈 **Shein**: 6,500 IQD/كجم
3. 🥉 **Other**: 7,000 IQD/كجم
4. 🏁 **Amazon**: 8,000 IQD/كجم (الأغلى)

### مقارنة شحنة 5 كيلو:
1. 🥇 **Sheglam**: 5 × 5,500 = 27,500 IQD
2. 🥈 **Shein**: 5 × 6,500 = 32,500 IQD
3. 🥉 **Other**: 5 × 7,000 = 35,000 IQD
4. 🏁 **Amazon**: 5 × 8,000 = 40,000 IQD

### مقارنة شحنة 10 كيلو:
1. 🥇 **Sheglam**: 10 × 5,500 = 55,000 IQD
2. 🥈 **Shein**: 10 × 6,500 = 65,000 IQD
3. 🥉 **Other**: 10 × 7,000 = 70,000 IQD
4. 🏁 **Amazon**: 10 × 8,000 = 80,000 IQD

---

## ✅ الخلاصة

- ✔️ كل منصة لها أسعار مختلفة
- ✔️ الأسعار محفوظة في الباك اند
- ✔️ الفرونت اند يمكنه جلب الأسعار عبر API
- ✔️ الحساب تلقائي بناءً على المنصة والوزن
- ✔️ يمكن تعديل الأسعار بسهولة من الكود

للمزيد من المعلومات، راجع:
- Swagger Docs: http://localhost:3000/api
- Backend Code: `src/admin/shipments/shipments.service.ts`

