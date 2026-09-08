# 📦 SQLite Item & Order Manager - Node.js & Express REST API

A modern RESTful API built with **Node.js**, **Express.js**, and **SQLite3** for managing clothing products/inventory and customer orders for **AR Clothing & Designs**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed SQLite Database
Seed items catalog and sample clothing product orders:
```bash
npm run seed
```

### 3. Start Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

---

## 📡 REST API Documentation

### 🌐 Root & Health Check
- `http://localhost:5000/` -> Opens the AR Clothing & Designs website.
- `http://localhost:5000/api` -> Returns API overview & endpoint map.
- `http://localhost:5000/api/health` -> Server status check.

---

### 🛍️ Clothing Product Orders API

#### 1. Get Clothing Order Metrics
Calculates Total Orders, Total Revenue, Delivered Count, Shipped Count, Processing Count, and Pending Payment Count.
- **URL**: `GET /api/orders/stats`
- **Response**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 4,
    "totalRevenue": 796.00,
    "processingOrders": 1,
    "shippedOrders": 1,
    "deliveredOrders": 1,
    "pendingPaymentOrders": 1
  }
}
```

#### 2. Get All Clothing Orders (with Search & Filters)
- **URL**: `GET /api/orders`
- **Query Parameters**:
  - `search`: Search by order number, customer name, email, or product name.
  - `order_status`: Filter by `Processing`, `Shipped`, `Delivered`, `Pending`, `Cancelled`.
  - `payment_status`: Filter by `Paid`, `Pending`.
  - `sort`: `id_desc`, `id_asc`, `amount_desc`, `amount_asc`.
- **Response**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2026-8801",
      "customer_name": "Sophia Anderson",
      "customer_email": "sophia.a@example.com",
      "customer_phone": "+1 555-0192",
      "shipping_address": "742 Evergreen Terrace, Springfield, OR",
      "product_name": "Noir Executive Suit",
      "size": "L",
      "quantity": 1,
      "unit_price": 349.00,
      "total_amount": 349.00,
      "payment_status": "Paid",
      "order_status": "Delivered",
      "created_at": "2026-09-07 10:14:00"
    }
  ]
}
```

#### 3. Create New Order
- **URL**: `POST /api/orders`
- **Body Payload**:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1 555-9876",
  "shipping_address": "123 Main St, New York, NY",
  "product_name": "Urban Fleece Hoodie",
  "size": "M",
  "quantity": 2,
  "unit_price": 129.00,
  "payment_status": "Paid"
}
```

#### 4. Update Order Status / Details
- **URL**: `PUT /api/orders/:id`
- **Body Payload**:
```json
{
  "order_status": "Shipped",
  "payment_status": "Paid"
}
```

#### 5. Cancel / Delete Order
- **URL**: `DELETE /api/orders/:id`

---

### 📦 Clothing Product Catalog & Inventory API

#### 1. Inventory Summary Metrics
- **URL**: `GET /api/items/stats`

#### 2. Get Catalog Items
- **URL**: `GET /api/items` (Supports `?search=...`, `?category=...`, `?status=...`)

#### 3. Add Item
- **URL**: `POST /api/items`

#### 4. Update Item
- **URL**: `PUT /api/items/:id`

#### 5. Delete Item
- **URL**: `DELETE /api/items/:id`
