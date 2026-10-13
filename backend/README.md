# DriveCare Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and JWT secret.

4. Make sure MongoDB is running locally or use MongoDB Atlas.

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Cars
- `GET /api/cars` - Get all user's cars
- `POST /api/cars` - Add new car (with VIN lookup)
- `DELETE /api/cars/:id` - Delete car

### Expenses
- `GET /api/expenses/:carId` - Get expenses for a car
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/:id` - Delete expense

### Bookings
- `GET /api/bookings` - Get all user's bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Delete booking

## Project Structure

```
backend/
├── config/          # Configuration files
├── models/          # Mongoose models
├── routes/          # Express routes
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── server.js        # Entry point
└── .env            # Environment variables
```
