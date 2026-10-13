# DriveCare Testing Guide

This guide will help you test all features of the DriveCare application.

## Prerequisites

Before testing, ensure:
1. ✅ MongoDB is installed and running
2. ✅ Backend server is running (`npm run dev` in backend folder)
3. ✅ Frontend server is running (`npm run dev` in frontend folder)
4. ✅ Both servers are accessible (Backend: http://localhost:5000, Frontend: http://localhost:5173)

## Testing Checklist

### 1. Authentication Testing

#### Test Signup
- [ ] Navigate to http://localhost:5173
- [ ] Click "Sign up" link
- [ ] Fill in registration form:
  - Name: John Doe
  - Email: john@example.com
  - Password: password123
  - Confirm Password: password123
- [ ] Click "Sign Up"
- [ ] Verify: Redirected to dashboard
- [ ] Verify: Welcome message shows your name

#### Test Login
- [ ] Logout from the dashboard
- [ ] Navigate to login page
- [ ] Enter credentials from signup
- [ ] Click "Sign In"
- [ ] Verify: Successfully logged in
- [ ] Verify: Dashboard loads with your data

#### Test Protected Routes
- [ ] Logout
- [ ] Try accessing http://localhost:5173/dashboard directly
- [ ] Verify: Redirected to login page

### 2. Garage (Car Management) Testing

#### Test VIN Lookup Feature (THE KILLER FEATURE!)
- [ ] Login to dashboard
- [ ] Navigate to "Garage" from sidebar
- [ ] Click "Add Vehicle" button
- [ ] In the modal, enter a valid VIN in the "VIN Lookup" field:
  - Test VIN: `5UXWX7C5*BA` (BMW X3)
  - Or: `1HGBH41JXMN109186` (Honda)
- [ ] Click the search button
- [ ] Verify: Make, Model, and Year auto-fill
- [ ] Add optional nickname: "My Daily Driver"
- [ ] Click "Add Vehicle"
- [ ] Verify: Vehicle appears in garage grid
- [ ] Verify: Success message appears

#### Test Manual Car Entry
- [ ] Click "Add Vehicle" again
- [ ] Manually enter:
  - VIN: 12345678901234567
  - Make: Toyota
  - Model: Camry
  - Year: 2020
  - Nickname: Family Car
- [ ] Click "Add Vehicle"
- [ ] Verify: Car added successfully

#### Test Delete Car
- [ ] Click trash icon on any car
- [ ] Confirm deletion
- [ ] Verify: Car removed from list

### 3. Expense Tracker Testing

#### Test Add Expense
- [ ] Navigate to "Expenses" from sidebar
- [ ] Click "Add Expense"
- [ ] Fill in expense form:
  - Vehicle: Select first car
  - Category: Fuel
  - Amount: 50.00
  - Date: Today's date
  - Description: Regular fuel fill-up
- [ ] Click "Add Expense"
- [ ] Verify: Expense appears in list

#### Test Data Visualization
- [ ] Add multiple expenses with different categories:
  - Fuel: $50
  - Repair: $200
  - Insurance: $100
  - Maintenance: $75
- [ ] Verify: Pie chart displays correctly
- [ ] Click "Bar" button
- [ ] Verify: Bar chart displays correctly
- [ ] Verify: Total expense amount is correct
- [ ] Verify: Color coding matches categories

#### Test Delete Expense
- [ ] Click trash icon on any expense
- [ ] Confirm deletion
- [ ] Verify: Expense removed
- [ ] Verify: Chart updates automatically

### 4. Booking System Testing

#### Test Create Booking
- [ ] Navigate to "Bookings" from sidebar
- [ ] Click "New Booking"
- [ ] Fill in booking form:
  - Vehicle: Select a car
  - Service Type: Oil Change
  - Date: Tomorrow's date
  - Time: 10:00 AM
  - Description: Regular maintenance check
- [ ] Click "Create Booking"
- [ ] Verify: Booking appears in "Upcoming Appointments"

#### Test Status Management
- [ ] In upcoming bookings, click "Confirm" on a pending booking
- [ ] Verify: Status changes to "Confirmed"
- [ ] Click "Complete" on a confirmed booking
- [ ] Verify: Booking moves to "Past Appointments"

#### Test Multiple Bookings
- [ ] Create 2-3 more bookings with different service types:
  - Tire Rotation
  - Brake Service
  - Inspection
- [ ] Verify: All bookings display correctly
- [ ] Verify: Upcoming/Past sections work properly

#### Test Delete Booking
- [ ] Click trash icon on any booking
- [ ] Confirm deletion
- [ ] Verify: Booking removed

### 5. Dashboard Overview Testing

#### Test Statistics
- [ ] Navigate to "Dashboard" (home icon)
- [ ] Verify: Total Vehicles count is correct
- [ ] Verify: Total Expenses amount is correct
- [ ] Verify: Upcoming Bookings count is correct

#### Test Recent Activity
- [ ] Verify: Recent expenses display (up to 5)
- [ ] Verify: Each expense shows:
  - Category name
  - Car details
  - Amount
  - Date

#### Test Quick Actions
- [ ] Click "Add Vehicle" quick action
- [ ] Verify: Navigates to Garage page
- [ ] Go back to Dashboard
- [ ] Click "Log Expense"
- [ ] Verify: Navigates to Expenses page
- [ ] Go back to Dashboard
- [ ] Click "Book Service"
- [ ] Verify: Navigates to Bookings page

### 6. UI/UX Testing

#### Test Responsive Design
- [ ] Resize browser window to mobile size (< 768px)
- [ ] Verify: Hamburger menu appears
- [ ] Click hamburger menu
- [ ] Verify: Sidebar slides in
- [ ] Click outside sidebar
- [ ] Verify: Sidebar closes
- [ ] Test all pages on mobile view

#### Test Navigation
- [ ] Click each sidebar link
- [ ] Verify: Active state highlights correctly
- [ ] Verify: Page content changes appropriately

#### Test Form Validation
- [ ] Try submitting forms without required fields
- [ ] Verify: Validation messages appear
- [ ] Try invalid email in signup
- [ ] Verify: Email validation works
- [ ] Try password mismatch in signup
- [ ] Verify: Password match validation works

### 7. Edge Cases Testing

#### Test Empty States
- [ ] Create a new user account
- [ ] Verify: "No vehicles" message displays in Garage
- [ ] Verify: "No expenses" message displays in Expenses
- [ ] Verify: "No bookings" message displays in Bookings
- [ ] Verify: Dashboard shows zeros for all stats

#### Test Long Data
- [ ] Add a car with very long nickname
- [ ] Add an expense with long description
- [ ] Verify: Text truncates or wraps properly

#### Test Date Validation
- [ ] Try creating a booking for a past date
- [ ] Verify: Error message appears (if validation is working)

## Expected Results Summary

After completing all tests, you should have:

✅ **Authentication**
- Working signup/login/logout
- Protected routes functioning
- Token-based sessions

✅ **Garage**
- Multiple vehicles added
- VIN lookup working (auto-fill)
- Vehicles displaying in grid
- Delete functionality working

✅ **Expenses**
- Multiple expenses logged
- Pie chart showing expense breakdown
- Bar chart as alternative view
- Color-coded categories
- Correct total calculations

✅ **Bookings**
- Multiple appointments created
- Status management working (Pending → Confirmed → Completed)
- Upcoming and Past sections separating correctly
- Date/time display working

✅ **Dashboard**
- Correct statistics
- Recent activity feed
- Quick action navigation

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running. Start it with `mongod` command.

### Issue: "Network Error" in frontend
**Solution:** Check backend is running on port 5000. Check CORS is enabled.

### Issue: "Invalid VIN" error
**Solution:** VIN must be exactly 17 characters. Try sample VINs provided above.

### Issue: Charts not displaying
**Solution:** Make sure you have expenses added with different categories.

## Sample Test Data

### Sample VINs for Testing:
- BMW X3: `5UXWX7C5*BA`
- Honda Accord: `1HGBH41JXMN109186`
- Toyota Camry: `4T1BF1FK5CU123456`
- Ford F-150: `1FTFW1E85KFA12345`

### Sample User Credentials:
- Email: test@drivecare.com
- Password: Test123!

### Sample Expenses:
1. Fuel: $50.00
2. Repair: $250.00
3. Insurance: $150.00
4. Maintenance: $80.00
5. Registration: $120.00
6. Other: $45.00

## Performance Checks

- [ ] Page load times are reasonable (< 2 seconds)
- [ ] No console errors in browser
- [ ] API responses are fast (< 500ms)
- [ ] Images/icons load properly
- [ ] Animations are smooth

## Security Checks

- [ ] Passwords are not visible in network requests
- [ ] JWT tokens are properly stored
- [ ] Cannot access other users' data
- [ ] Protected routes redirect to login

## Final Verification

✅ All 4 core features working:
1. Authentication with JWT
2. VIN Decoder Integration (NHTSA API)
3. Expense Tracking with Charts (Recharts)
4. Booking System with Status Management

✅ Database relationships working:
- User → Cars
- Cars → Expenses
- User → Bookings

✅ UI/UX is polished:
- Responsive design
- Loading states
- Error handling
- Success messages

---

**Congratulations!** If all tests pass, your DriveCare application is fully functional and ready for your portfolio or placement interviews! 🎉
