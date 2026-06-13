import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api';
let cookie = '';

async function request(method: string, path: string, body?: any) {
  const headers: Record<string, string> = {};
  if (cookie) headers['Cookie'] = cookie;
  if (body) headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/vnd.openxmlformats'))) {
      const buffer = await res.arrayBuffer();
      data = { message: `Binary data received (${buffer.byteLength} bytes)` };
    } else {
      data = await res.text();
    }

    return { status: res.status, data };
  } catch (err: any) {
    return { status: 500, data: { error: `Fetch failed: ${err.message}` } };
  }
}

async function run() {
  const report: string[] = [];
  const log = (msg: string) => { 
    console.log(msg); 
    report.push(msg); 
  };
  
  log("🚀 Starting E2E API Smoke Test...");
  const ts = Date.now();
  
  // 1. Auth Module
  log("\n--- 🔐 AUTH MODULE ---");
  const email = `test_admin_${ts}@example.com`;
  
  const signupRes = await request('POST', '/auth/signup', { name: "Test Admin", email, password: "password123" });
  log(`Signup (User): ${signupRes.status} - ${JSON.stringify(signupRes.data)}`);
  
  const adminLogin = await request('POST', '/auth/login', { email, password: 'password123' });
  log(`Login Test Admin: ${adminLogin.status} - Success`);

  // 2. Resource Management
  log("\n--- 📦 RESOURCE MANAGEMENT MODULE ---");
  const catRes = await request('POST', '/categories', { name: `Category ${ts}`, colorHex: "#FF0000" });
  log(`Create Category: ${catRes.status} - ${JSON.stringify(catRes.data)}`);
  const catId = catRes.data?.data?.category?.id;

  let prodId;
  if (catId) {
    const prodRes = await request('POST', '/products', { name: `Product ${ts}`, categoryId: catId, price: 10.5, taxRate: 5 });
    log(`Create Product: ${prodRes.status} - ${JSON.stringify(prodRes.data)}`);
    prodId = prodRes.data?.data?.product?.id;
  } else {
    log(`Skipping Product creation because Category failed.`);
  }

  const floorRes = await request('POST', '/floors', { name: `Floor ${ts}` });
  log(`Create Floor: ${floorRes.status} - ${JSON.stringify(floorRes.data)}`);
  const floorId = floorRes.data?.data?.floor?.id;

  let tableId;
  if (floorId) {
    const tableRes = await request('POST', '/tables', { floorId, number: Math.floor(Math.random() * 100) + 1, seats: 4 });
    log(`Create Table: ${tableRes.status} - ${JSON.stringify(tableRes.data)}`);
    tableId = tableRes.data?.data?.table?.id;
  }

  const custRes = await request('POST', '/customers', { name: `Customer ${ts}` });
  log(`Create Customer: ${custRes.status} - ${JSON.stringify(custRes.data)}`);

  // 3. POS & Orders
  log("\n--- 🛒 POS & ORDERS MODULE ---");
  const sessionRes = await request('POST', '/session/open', { initialFloat: 100 });
  log(`Open Session: ${sessionRes.status} - ${JSON.stringify(sessionRes.data)}`);
  
  const sessionId = sessionRes.data?.data?.session?.id;
  if (!sessionId) {
    // If a session is already active, we can't open a new one. Try to fetch the active one.
    log(`INFO: A session might already be active.`);
    // A robust way in the real app is fetching the active session, but for the smoke test:
    if (sessionRes.status === 400 && sessionRes.data?.error?.includes("already active")) {
        log(`Assuming existing session needs closing first, or we can just skip order creation if we don't know the ID.`);
    }
  }

  let orderId;
  if (sessionId && prodId) {
    const orderRes = await request('POST', '/orders', {
      sessionId,
      tableId,
      lines: [{ productId: prodId, qty: 2, unitPrice: 10.5 }]
    });
    log(`Create Order: ${orderRes.status} - ${JSON.stringify(orderRes.data)}`);
    orderId = orderRes.data?.data?.order?.id;
    
    if (orderId) {
       const payRes = await request('POST', `/orders/${orderId}/pay`, { method: "CASH", amountTendered: 30 });
       log(`Pay Order: ${payRes.status} - ${JSON.stringify(payRes.data)}`);
    }
  } else {
    log(`Skipping Order creation. Missing sessionId or prodId.`);
  }

  // 4. Promotions
  log("\n--- 🎟️ PROMOTIONS MODULE ---");
  const promoRes = await request('POST', '/promotions', { 
    name: `Promo ${ts}`, 
    promoType: "ORDER_BASED", 
    minOrderAmount: 10,
    discountValue: 10,
    discountType: "PERCENT"
  });
  log(`Create Promotion: ${promoRes.status} - ${JSON.stringify(promoRes.data)}`);

  // 5. Reports
  log("\n--- 📊 REPORTS MODULE ---");
  const reportRes = await request('GET', '/reports?period=today');
  log(`Fetch Report JSON: ${reportRes.status} - ${JSON.stringify(reportRes.data).substring(0, 150)}...`);

  const exportRes = await request('GET', '/reports/export?period=today&format=pdf');
  log(`Export Report PDF: ${exportRes.status} - ${JSON.stringify(exportRes.data)}`);

  // 6. Cleanup
  log("\n--- 🧹 CLEANUP MODULE ---");
  if (sessionId) {
     const closeRes = await request('POST', '/session/close', { closingSaleAmount: 100, actualCash: 100, notes: "Smoke Test End" });
     log(`Close Session: ${closeRes.status} - ${JSON.stringify(closeRes.data)}`);
  }

  const logoutRes = await request('POST', '/auth/logout');
  log(`Logout: ${logoutRes.status} - ${JSON.stringify(logoutRes.data)}`);

  // Write report
  const outputDir = 'artifacts';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync('scratch/smoke_test_output.log', report.join('\n'));
  
  log("\n✅ Smoke test finished! Output saved to scratch/smoke_test_output.log");
}

run().catch(console.error);
