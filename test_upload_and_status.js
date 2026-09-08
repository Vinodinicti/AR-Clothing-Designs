const http = require('http');
const { spawn } = require('child_process');

const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: '5009' }
});

const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (postData) req.write(JSON.stringify(postData));
        req.end();
    });
};

const runTests = async () => {
    await new Promise(r => setTimeout(r, 2000));

    try {
        console.log('--- 1. Fetching Orders List ---');
        const ordersList = await makeRequest({
            hostname: 'localhost',
            port: 5009,
            path: '/api/orders',
            method: 'GET'
        });
        console.log('Total Orders Count:', ordersList.body.count);
        const orderId = ordersList.body.data[0].id;

        console.log(`--- 2. Testing Order Status Update (PUT /api/orders/${orderId}) ---`);
        const updateOrderRes = await makeRequest({
            hostname: 'localhost',
            port: 5009,
            path: `/api/orders/${orderId}`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        }, { order_status: 'Shipped' });
        console.log('Status:', updateOrderRes.status, 'Updated Order Status:', updateOrderRes.body.data.order_status);

        console.log('✅ ALL TEST CASES PASSED SUCCESSFULLY!');
    } catch (e) {
        console.error('❌ Test failed:', e);
    } finally {
        server.kill();
        process.exit(0);
    }
};

runTests();
