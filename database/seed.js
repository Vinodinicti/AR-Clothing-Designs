require('dotenv').config();
const { initDb, dbAsync, db } = require('../config/db');

const initialItems = [
    {
        title: 'Noir Executive Suit',
        category: "Men's Formal",
        price: 3499.00,
        status: 'In Stock',
        description: 'Tailored navy wool-blend double-breasted suit featuring structured shoulders and satin lapels.',
        image: 'images/designs/design-1.jpg',
        original_price: 4499.00,
        tag: 'BESTSELLER',
        sizes: 'M, L, XL, XXL'
    },
    {
        title: 'Urban Fleece Hoodie',
        category: 'Hoodies & Sweats',
        price: 1299.00,
        status: 'In Stock',
        description: 'Heavyweight 420 GSM organic french terry pullover hoodie with dropped shoulders.',
        image: 'images/designs/design-2.jpg',
        original_price: 1799.00,
        tag: 'TRENDING',
        sizes: 'S, M, L, XL'
    },
    {
        title: 'Classic Knit Sweater',
        category: "Women's Casual",
        price: 1099.00,
        status: 'In Stock',
        description: 'Relaxed boat-neck knit sweater crafted with ultra-soft combed cotton for everyday comfort.',
        image: 'images/designs/design-3.jpg',
        original_price: 1499.00,
        tag: 'POPULAR',
        sizes: 'S, M, L, XL'
    },
    {
        title: 'Emerald Drape Dress',
        category: "Women's Dresses",
        price: 1899.00,
        status: 'In Stock',
        description: 'Fluid midi silhouette dress with elegant quarter sleeves and tailored waist gathering.',
        image: 'images/designs/design-4.jpg',
        original_price: 2499.00,
        tag: 'CLASSIC',
        sizes: 'S, M, L, XL'
    },
    {
        title: 'Golden Line Evening Gown',
        category: "Women's Evening",
        price: 2999.00,
        status: 'In Stock',
        description: 'Statement plunge-neck maroon evening gown featuring tailored drape and delicate gold trimming.',
        image: 'images/designs/design-5.jpg',
        original_price: 3799.00,
        tag: 'FEATURED',
        sizes: 'S, M, L, XL'
    },
    {
        title: 'Executive Formal Shirt',
        category: "Men's Shirts",
        price: 1599.00,
        status: 'In Stock',
        description: 'Luxury Egyptian giza cotton formal shirt with an immaculate stitch count and satin finish.',
        image: 'images/designs/design-6.jpg',
        original_price: 2199.00,
        tag: 'FORMAL LUXE',
        sizes: 'M, L, XL, XXL'
    }
];

const initialOrders = [
    {
        order_number: 'ORD-2026-8801',
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav.sharma@example.com',
        customer_phone: '+91 98765 43210',
        shipping_address: '742 Park Street, Indiranagar, Bengaluru, KA',
        product_name: 'Noir Executive Suit',
        size: 'L',
        quantity: 1,
        unit_price: 3499.00,
        total_amount: 3499.00,
        payment_status: 'Paid',
        order_status: 'Delivered'
    },
    {
        order_number: 'ORD-2026-8802',
        customer_name: 'Priya Patel',
        customer_email: 'priya.patel@example.com',
        customer_phone: '+91 98123 45678',
        shipping_address: '100 Marine Drive, Nariman Point, Mumbai, MH',
        product_name: 'Urban Fleece Hoodie',
        size: 'XL',
        quantity: 2,
        unit_price: 1299.00,
        total_amount: 2598.00,
        payment_status: 'Paid',
        order_status: 'Shipped'
    },
    {
        order_number: 'ORD-2026-8803',
        customer_name: 'Rohan Gupta',
        customer_email: 'rohan.gupta@example.com',
        customer_phone: '+91 97110 22334',
        shipping_address: '450 Connaught Place, New Delhi, DL',
        product_name: 'Emerald Drape Dress',
        size: 'M',
        quantity: 1,
        unit_price: 1899.00,
        total_amount: 1899.00,
        payment_status: 'Paid',
        order_status: 'Processing'
    },
    {
        order_number: 'ORD-2026-8804',
        customer_name: 'Ananya Reddy',
        customer_email: 'ananya.reddy@example.com',
        customer_phone: '+91 99887 66554',
        shipping_address: '120 Jubilee Hills, Hyderabad, TS',
        product_name: 'Golden Line Evening Gown',
        size: 'S',
        quantity: 1,
        unit_price: 2999.00,
        total_amount: 2999.00,
        payment_status: 'Pending',
        order_status: 'Pending'
    },
    {
        order_number: 'ORD-2026-8805',
        customer_name: 'Vikram Malhotra',
        customer_email: 'vikram.malhotra@example.com',
        customer_phone: '+91 98989 12345',
        shipping_address: '88 MG Road, Commercial Street, Bengaluru, KA',
        product_name: 'Executive Formal Shirt',
        size: 'L',
        quantity: 1,
        unit_price: 1599.00,
        total_amount: 1599.00,
        payment_status: 'Paid',
        order_status: 'Shipped'
    }
];

const initialUsers = [
    {
        name: 'AR Admin',
        email: 'admin@arclothing.com',
        password: 'admin123',
        phone: '+91 90000 00001',
        role: 'admin',
        status: 'Active'
    },
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'customer',
        status: 'Active'
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: 'password123',
        phone: '+91 98123 45678',
        role: 'customer',
        status: 'Active'
    },
    {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@example.com',
        password: 'password123',
        phone: '+91 97110 22334',
        role: 'customer',
        status: 'Active'
    },
    {
        name: 'Ananya Reddy',
        email: 'ananya.reddy@example.com',
        password: 'password123',
        phone: '+91 99887 66554',
        role: 'customer',
        status: 'Active'
    },
    {
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@example.com',
        password: 'password123',
        phone: '+91 98989 12345',
        role: 'customer',
        status: 'Active'
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Initializing SQLite Database Tables...');
        await initDb();

        console.log('🧹 Clearing existing items, orders, & users...');
        await dbAsync.run('DELETE FROM items');
        await dbAsync.run('DELETE FROM orders');
        await dbAsync.run('DELETE FROM users');

        console.log('👗 Seeding catalog items...');
        for (const item of initialItems) {
            const sql = `
                INSERT INTO items (title, category, price, status, description, image, original_price, tag, sizes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await dbAsync.run(sql, [
                item.title,
                item.category,
                item.price,
                item.status,
                item.description,
                item.image,
                item.original_price,
                item.tag,
                item.sizes
            ]);
        }

        console.log('🛍️ Seeding clothing product orders...');
        for (const order of initialOrders) {
            const sql = `
                INSERT INTO orders (
                    order_number, customer_name, customer_email, customer_phone,
                    shipping_address, product_name, size, quantity,
                    unit_price, total_amount, payment_status, order_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await dbAsync.run(sql, [
                order.order_number,
                order.customer_name,
                order.customer_email,
                order.customer_phone,
                order.shipping_address,
                order.product_name,
                order.size,
                order.quantity,
                order.unit_price,
                order.total_amount,
                order.payment_status,
                order.order_status
            ]);
        }

        console.log('👤 Seeding Admin & Customer Accounts...');
        for (const u of initialUsers) {
            const sql = `
                INSERT INTO users (name, email, password, phone, role, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await dbAsync.run(sql, [u.name, u.email, u.password, u.phone, u.role, u.status]);
        }

        const itemsCount = await dbAsync.get('SELECT COUNT(*) as count FROM items');
        const ordersCount = await dbAsync.get('SELECT COUNT(*) as count FROM orders');
        const usersCount = await dbAsync.get('SELECT COUNT(*) as count FROM users');

        console.log(`✅ Database seeded with ${itemsCount.count} products, ${ordersCount.count} orders, and ${usersCount.count} user accounts!`);

        db.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err.message);
        process.exit(1);
    }
};

seedDatabase();
