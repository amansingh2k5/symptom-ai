SymptomAI — Backend API
A Node.js & Express service that powers a health assistant app with AI analysis and doctor discovery.

🛠 Tech Stack
Runtime: Node.js, Express

Database: MongoDB (Mongoose)

AI/External: OpenAI (Symptom Analysis), Google Places API (Doctor Search)

Auth: JWT & Bcrypt

Emails: Nodemailer (Gmail SMTP)



 Core Endpoints
Auth: POST /api/auth/register, POST /api/auth/login

AI Check: POST /api/symptoms/check (Pass tags + description)

Doctors: GET /api/doctors/nearby?lat=xx&lng=xx

Reminders: POST /api/reminders (Scheduled meds)

 Key Logic
utils/emailService.js: Handles all transactional emails (Reset pass, verification).

middleware/authMiddleware.js: Protects private routes using JWT.

controllers/symptomController.js: Wraps OpenAI for structured medical feedback.