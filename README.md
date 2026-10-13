# DriveCare - Smart Vehicle Garage & Maintenance Scheduler

A full-stack web application for managing vehicle maintenance, tracking expenses, and scheduling service appointments. Built as a portfolio project to demonstrate modern web development skills.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### ✅ Core Functionality

1. **User Authentication**
   - Secure signup/login with JWT tokens
   - Password hashing with bcrypt
   - Protected routes and session management
   - Token-based authorization

2. **Smart Garage (VIN API Integration)**
   - Add vehicles using VIN number
   - **Auto-fill vehicle details** using NHTSA VIN Decoder API
   - Manual entry option for all vehicle details
   - View all registered vehicles
   - Delete vehicles with confirmation

3. **Expense Tracker (Data Visualization)**
   - Log expenses by category (Fuel, Repair, Insurance, Maintenance, etc.)
   - **Interactive Pie Chart** showing expense breakdown
   - **Bar Chart** visualization toggle
   - Total expense calculation and statistics
   - Category-based color coding
   - Expense history with filtering

4. **Booking System**
   - Schedule service appointments
   - Select vehicle, service type, date, and time
   - Status management (Pending → Confirmed → Completed)
   - Separate views for upcoming and past appointments
   - Update and delete bookings

5. **Dashboard Overview**
   - Summary statistics (Total cars, expenses, bookings)
   - Recent activity feed
   - Quick action buttons
   - Responsive design with mobile support

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

### External APIs
- **NHTSA VIN Decoder API** - Vehicle information lookup

## 📦 Project Structure

```
DriveCare/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── carController.js    # Car CRUD + VIN decoder
│   │   ├── expenseController.js # Expense tracking
│   │   └── bookingController.js # Booking management
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Car.js              # Car schema
│   │   ├── Expense.js          # Expense schema
│   │   └── Booking.js          # Booking schema
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── cars.js             # Car routes
│   │   ├── expenses.js         # Expense routes
│   │   └── bookings.js         # Booking routes
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx  # Main layout
│   │   │   └── PrivateRoute.jsx     # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Signup page
│   │   │   ├── DashboardHome.jsx    # Dashboard overview
│   │   │   ├── Garage.jsx           # Car management
│   │   │   ├── Expenses.jsx         # Expense tracker
│   │   │   └── Bookings.jsx         # Booking system
│   │   ├── utils/
│   │   │   └── api.js               # Axios configuration
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DriveCare
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your settings:
   # PORT=5000
   # MONGODB_URI=mongodb://localhost:27017/drivecare
   # JWT_SECRET=your_secure_secret_key
   # NODE_ENV=development
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud database)
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Backend runs on http://localhost:5000
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create an account or login
   - Start managing your vehicles!

## 📋 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
```

### Cars
```
GET    /api/cars             - Get all user's cars (protected)
GET    /api/cars/decode/:vin - Decode VIN (protected)
POST   /api/cars             - Add new car (protected)
DELETE /api/cars/:id         - Delete car (protected)
```

### Expenses
```
GET    /api/expenses         - Get all expenses (protected)
GET    /api/expenses/:carId  - Get expenses for specific car (protected)
POST   /api/expenses         - Add new expense (protected)
DELETE /api/expenses/:id     - Delete expense (protected)
```

### Bookings
```
GET    /api/bookings         - Get all bookings (protected)
POST   /api/bookings         - Create new booking (protected)
PUT    /api/bookings/:id     - Update booking status (protected)
DELETE /api/bookings/:id     - Delete booking (protected)
```

## 🎯 Key Features for Technical Interviews

### 1. **Third-Party API Integration**
- Integrated NHTSA VIN Decoder API
- Demonstrates understanding of external API consumption
- Error handling and data transformation

### 2. **Database Relationships**
- User → Cars (One-to-Many)
- Car → Expenses (One-to-Many)
- User → Bookings (One-to-Many)
- Proper use of MongoDB references

### 3. **Data Visualization**
- Recharts integration for Pie and Bar charts
- Real-time expense aggregation
- Category-based analytics

### 4. **Authentication & Authorization**
- JWT-based authentication
- Protected routes on both frontend and backend
- Password hashing with bcrypt
- Token storage and management

### 5. **Modern Frontend Practices**
- React Hooks (useState, useEffect, useContext)
- Context API for global state
- Component composition and reusability
- Responsive design with Tailwind CSS

### 6. **RESTful API Design**
- CRUD operations
- Proper HTTP methods and status codes
- Request validation
- Error handling middleware

## 🎨 UI/UX Highlights

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Interactive Charts** - Visual representation of expense data
- **Form Validation** - Client and server-side validation
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Modal Dialogs** - For adding cars, expenses, and bookings

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes with middleware
- Input validation on all forms
- CORS configuration
- Environment variables for sensitive data

## 📝 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Car
```javascript
{
  user: ObjectId (ref: User),
  vin: String (17 chars),
  make: String,
  model: String,
  year: Number,
  nickname: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense
```javascript
{
  car: ObjectId (ref: Car),
  category: String (enum),
  amount: Number,
  description: String,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  user: ObjectId (ref: User),
  car: ObjectId (ref: Car),
  serviceType: String (enum),
  description: String,
  scheduledDate: Date,
  status: String (enum: Pending/Confirmed/Completed/Cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚢 Deployment

### Backend (Option 1: Heroku)
1. Create Heroku app
2. Add MongoDB Atlas connection string
3. Set environment variables
4. Deploy: `git push heroku main`

### Backend (Option 2: Railway/Render)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- Full-stack JavaScript development
- RESTful API design and implementation
- Database modeling and relationships
- Authentication and authorization
- Third-party API integration
- Data visualization
- Modern React patterns
- Responsive UI design
- Git version control

## 📸 Screenshots

*(Add screenshots here after testing)*

- Login Page
- Dashboard Overview
- Garage with VIN Lookup
- Expense Tracker with Charts
- Booking System

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome!

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built as a portfolio project to showcase full-stack development skills.

## 🙏 Acknowledgments

- NHTSA for providing free VIN decoder API
- React community for excellent libraries
- Tailwind CSS for utility-first styling
- MongoDB for flexible database solutions

---

**Note:** This project was built to demonstrate technical skills for placement interviews and portfolio showcasing. It includes all key features recruiters look for: authentication, database relationships, API integration, and data visualization.
