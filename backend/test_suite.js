const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Car = require('./models/Car');
const Expense = require('./models/Expense');
const Booking = require('./models/Booking');
const http = require('http');
const axios = require('axios');

let server;
let baseURL;

const runTests = async () => {
  console.log('--- Starting DriveCare Automated Test Suite ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  };

  try {
    // 1. Connect DB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('[DB] Connected to MongoDB');

    // 2. Start server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        baseURL = `http://localhost:${port}`;
        console.log(`[SERVER] Test server listening on ${baseURL}`);
        resolve();
      });
    });

    const client = axios.create({
      baseURL,
      validateStatus: () => true // Do not throw on non-2xx so we can assert status codes
    });

    // TEST 1: Healthcheck
    const rootRes = await client.get('/');
    assert(rootRes.status === 200 && rootRes.data.message.includes('DriveCare'), 'Root endpoint returns 200');

    // TEST 2: User Registration
    const testEmail = `test_runner_${Date.now()}@example.com`;
    const regRes = await client.post('/api/auth/register', {
      name: 'Automated Tester',
      email: testEmail,
      password: 'password123'
    });
    assert(regRes.status === 201 && regRes.data.token, 'User registration succeeds and returns token');
    const token = regRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const userId = regRes.data._id;

    // TEST 3: User Registration - Duplicate Email
    const dupRes = await client.post('/api/auth/register', {
      name: 'Duplicate',
      email: testEmail,
      password: 'password123'
    });
    assert(dupRes.status === 400, 'Duplicate email registration rejected with 400');

    // TEST 4: User Registration - Short Password
    const shortPassRes = await client.post('/api/auth/register', {
      name: 'Short Pass',
      email: `short_${Date.now()}@example.com`,
      password: '123'
    });
    assert(shortPassRes.status === 400, 'Short password registration rejected with 400');

    // TEST 5: User Login - Success
    const loginRes = await client.post('/api/auth/login', {
      email: testEmail,
      password: 'password123'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'User login succeeds');

    // TEST 6: User Login - Wrong Password
    const badLoginRes = await client.post('/api/auth/login', {
      email: testEmail,
      password: 'wrongpassword'
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401');

    // TEST 7: Protected Route - Get Me
    const meRes = await client.get('/api/auth/me', authHeaders);
    assert(meRes.status === 200 && meRes.data.email === testEmail, 'GET /api/auth/me returns current user');

    // TEST 8: Protected Route - Unauthorized (no token)
    const unauthRes = await client.get('/api/auth/me');
    assert(unauthRes.status === 401, 'Unauthorized request without token returns 401');

    // TEST 9: VIN Decoder - 17 Character VIN
    const vin17Res = await client.get('/api/cars/decode/1HGBH41JXMN109186', authHeaders);
    assert(vin17Res.status === 200 && vin17Res.data.make === 'HONDA', '17-char VIN decodes correctly (HONDA)');

    // TEST 10: VIN Decoder - 11 Character VIN (from testing guide)
    const vin11Res = await client.get('/api/cars/decode/5UXWX7C5*BA', authHeaders);
    assert(vin11Res.status === 200 && vin11Res.data.make.toUpperCase().includes('BMW'), '11-char VIN decodes correctly (BMW)');

    // TEST 11: VIN Decoder - Invalid VIN
    const badVinRes = await client.get('/api/cars/decode/INVALIDVIN123', authHeaders);
    assert(badVinRes.status === 400, 'Invalid VIN returns 400 error');

    // TEST 12: Add Car
    const carRes = await client.post('/api/cars', {
      vin: '1HGBH41JXMN109186',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      nickname: 'Daily Cruiser'
    }, authHeaders);
    assert(carRes.status === 201 && carRes.data.vin === '1HGBH41JXMN109186', 'Add car returns 201');
    const carId = carRes.data._id;

    // TEST 13: Add Duplicate Car
    const dupCarRes = await client.post('/api/cars', {
      vin: '1HGBH41JXMN109186',
      make: 'Honda',
      model: 'Civic',
      year: 2021
    }, authHeaders);
    assert(dupCarRes.status === 400, 'Duplicate car for same user returns 400');

    // TEST 14: Get Cars
    const getCarsRes = await client.get('/api/cars', authHeaders);
    assert(getCarsRes.status === 200 && getCarsRes.data.length >= 1, 'GET /api/cars returns cars list');

    // TEST 15: Add Expense
    const expenseRes = await client.post('/api/expenses', {
      car: carId,
      category: 'Fuel',
      amount: 45.50,
      description: 'Test gas fill-up',
      date: new Date().toISOString()
    }, authHeaders);
    assert(expenseRes.status === 201 && expenseRes.data.amount === 45.50, 'Add expense returns 201');
    const expenseId = expenseRes.data._id;

    // TEST 16: Add Second Expense (Maintenance)
    const expense2Res = await client.post('/api/expenses', {
      car: carId,
      category: 'Maintenance',
      amount: 120.00,
      description: 'Brake pads replacement'
    }, authHeaders);
    assert(expense2Res.status === 201, 'Add second expense returns 201');

    // TEST 17: Get All Expenses
    const allExpensesRes = await client.get('/api/expenses', authHeaders);
    assert(allExpensesRes.status === 200 && allExpensesRes.data.length >= 2, 'GET /api/expenses returns expenses');

    // TEST 18: Get Car Expense Stats
    const statsRes = await client.get(`/api/expenses/${carId}/stats`, authHeaders);
    assert(statsRes.status === 200 && statsRes.data.total >= 165.50, 'GET /api/expenses/:carId/stats returns aggregated totals');

    // TEST 19: Create Booking (Future Date)
    const futureDate = new Date(Date.now() + 86400000 * 3); // 3 days in future
    const bookingRes = await client.post('/api/bookings', {
      car: carId,
      serviceType: 'Oil Change',
      description: 'Scheduled regular oil change',
      scheduledDate: futureDate.toISOString()
    }, authHeaders);
    assert(bookingRes.status === 201 && bookingRes.data.status === 'Pending', 'Create booking returns 201 with Pending status');
    const bookingId = bookingRes.data._id;

    // TEST 20: Create Booking with Past Date (Should Fail)
    const pastDate = new Date(Date.now() - 86400000);
    const badBookingRes = await client.post('/api/bookings', {
      car: carId,
      serviceType: 'Oil Change',
      description: 'Past booking',
      scheduledDate: pastDate.toISOString()
    }, authHeaders);
    assert(badBookingRes.status === 400, 'Past scheduled date booking rejected with 400');

    // TEST 21: Update Booking Status
    const updateBookingRes = await client.put(`/api/bookings/${bookingId}`, {
      status: 'Confirmed'
    }, authHeaders);
    assert(updateBookingRes.status === 200 && updateBookingRes.data.status === 'Confirmed', 'Update booking status to Confirmed returns 200');

    // TEST 22: Update Booking to Invalid Status (Should Fail)
    const badStatusRes = await client.put(`/api/bookings/${bookingId}`, {
      status: 'UnknownStatus'
    }, authHeaders);
    assert(badStatusRes.status === 400, 'Invalid booking status rejected with 400');

    // TEST 23: Delete Expense
    const delExpenseRes = await client.delete(`/api/expenses/${expenseId}`, authHeaders);
    assert(delExpenseRes.status === 200, 'Delete expense returns 200');

    // TEST 24: Cascade Deletion when Car is Deleted
    const delCarRes = await client.delete(`/api/cars/${carId}`, authHeaders);
    assert(delCarRes.status === 200, 'Delete car returns 200');

    const remainingExpenses = await Expense.find({ car: carId });
    const remainingBookings = await Booking.find({ car: carId });
    assert(remainingExpenses.length === 0, 'Associated expenses cascade deleted');
    assert(remainingBookings.length === 0, 'Associated bookings cascade deleted');

    // Cleanup test user
    await User.findByIdAndDelete(userId);
    console.log('[CLEANUP] Test user and artifacts cleaned up');

  } catch (error) {
    console.error('Test execution failed with error:', error);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
