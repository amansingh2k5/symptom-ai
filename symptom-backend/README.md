# SymptomAI — Backend API

Node.js + Express + MongoDB backend for the SymptomAI health assistant app.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd symptom-backend
npm install

# 2. Set up environment variables
cp .env.example .env
# → Fill in all values in .env (see section below)

# 3. Run in development
npm run dev

# 4. Test the health check
curl http://localhost:5000/api/health
```

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Any long random string (min 32 chars) |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → Enable Places API |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (not your login password) |

### Getting a Gmail App Password
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords" → Create one for "Mail"
4. Copy the 16-character password into `EMAIL_PASS`

---

## 📁 Project Structure

```
symptom-backend/
├── server.js              # Entry point — Express setup, DB connect
├── .env.example           # Environment variable template
├── config/
│   └── db.js              # MongoDB connection helper
├── models/
│   ├── User.js            # User schema (auth + health profile)
│   ├── SymptomLog.js      # AI symptom check results
│   ├── Booking.js         # Doctor appointments
│   └── Reminder.js        # Medication reminders
├── controllers/
│   ├── authController.js      # Register, Login, Verify, Reset Password
│   ├── symptomController.js   # OpenAI symptom analysis
│   ├── doctorController.js    # Google Maps Places API proxy
│   ├── bookingController.js   # Appointment booking + email
│   └── reminderController.js  # Medication reminder CRUD
├── routes/
│   ├── authRoutes.js
│   ├── symptomRoutes.js
│   ├── doctorRoutes.js
│   ├── bookingRoutes.js
│   └── reminderRoutes.js
├── middleware/
│   └── authMiddleware.js  # JWT protect + adminOnly
└── utils/
    ├── generateToken.js   # JWT signer
    ├── emailService.js    # Nodemailer — all email templates
    └── cronJobs.js        # node-cron — medication reminders
```

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user, sends verification email |
| POST | `/login` | ❌ | Login, returns JWT token |
| GET | `/verify-email?token=xxx` | ❌ | Verify email from link |
| POST | `/forgot-password` | ❌ | Send password reset email |
| POST | `/reset-password` | ❌ | Reset password with token |
| GET | `/me` | ✅ | Get logged-in user profile |
| PUT | `/profile` | ✅ | Update name + health profile |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "securepass123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "securepass123" }
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "email": "...", "role": "user" }
}
```

> All protected routes need: `Authorization: Bearer <token>` header

---

### Symptoms — `/api/symptoms`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/check` | ✅ | Run AI symptom analysis |
| GET | `/history` | ✅ | Get user's check history (paginated) |
| DELETE | `/:id` | ✅ | Delete a symptom log |

**Check body:**
```json
{
  "tags": ["Fever", "Headache"],
  "customText": "also feeling nauseous since morning"
}
```

**Check response:**
```json
{
  "success": true,
  "result": {
    "conditions": [
      { "name": "Viral Infection", "probability": "High", "specialist": "General Physician" }
    ],
    "advice": "Rest and stay hydrated. See a doctor if symptoms worsen.",
    "severity": "moderate",
    "disclaimer": "Not a substitute for professional medical advice."
  },
  "logId": "64abc..."
}
```

---

### Doctors — `/api/doctors`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/nearby?lat=28.6&lng=77.2&specialty=Cardiologist&radius=5000` | ✅ | Find nearby doctors via Google Maps |
| GET | `/:placeId` | ✅ | Get full details for a specific doctor |

---

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create booking + send confirmation email |
| GET | `/` | ✅ | Get all user's bookings |
| PATCH | `/:id/cancel` | ✅ | Cancel a booking |

**Create booking body:**
```json
{
  "doctor": {
    "placeId": "ChIJ...",
    "name": "Dr. Priya Sharma",
    "specialty": "General Physician",
    "hospital": "Apollo Clinic",
    "address": "123 MG Road",
    "phone": "+91 98765 43210"
  },
  "appointmentDate": "2026-03-20",
  "appointmentTime": "10:30 AM",
  "reason": "Persistent fever for 3 days"
}
```

---

### Reminders — `/api/reminders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create medication reminder |
| GET | `/` | ✅ | Get all reminders |
| PATCH | `/:id` | ✅ | Update reminder (toggle active, change times) |
| DELETE | `/:id` | ✅ | Delete reminder |

**Create reminder body:**
```json
{
  "medicationName": "Paracetamol",
  "dosage": "500mg",
  "times": ["08:00", "14:00", "20:00"],
  "notes": "Take after meals"
}
```

---

## 🌐 Deployment (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `.env`
7. Deploy — Render gives you a public URL like `https://symptom-ai.onrender.com`

### Update your React frontend
```js
// In your React app, set the API base URL:
const API_BASE = "https://symptom-ai.onrender.com/api";
```

---

## 🔒 Security Features

- **Passwords** hashed with bcrypt (12 salt rounds)
- **JWT** expires in 7 days
- **Rate limiting** on all routes (100/15min global, 5/15min on auth)
- **Email enumeration protection** on forgot-password endpoint
- **API keys** kept server-side — Google Maps key never exposed to frontend
- **Input validation** via express-validator on auth routes

---

## ⚠️ Medical Disclaimer

This application is for educational and informational purposes only.
It is **not** a substitute for professional medical advice, diagnosis, or treatment.
