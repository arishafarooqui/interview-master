# Interview Master 🎯

A live AI-powered interview preparation platform that generates personalized interview questions, tracks your progress, and helps you close skill gaps — built to make interview prep adaptive instead of generic.

🔗 **Live Demo:** [interview-master-xi.vercel.app](https://interview-master-xi.vercel.app/)

---

## ✨ Features

- **AI-Generated Interview Questions** — Tailored to your resume and target job description, powered by the Grok API
- **Match Score Dashboard** — See how well your profile matches a role, with a visual score breakdown
- **Skill Gap Analysis** — Identifies weak areas and generates a personalized day-by-day prep roadmap
- **Live Mock Interview Sessions** — Practice with realistic, role-specific questions
- **Downloadable Reports** — Auto-generated performance reports as PDF (via Puppeteer)
- **Secure Authentication** — JWT-based user auth

## 🛠️ Tech Stack

**Frontend:** React.js, Vercel  
**Backend:** Node.js, Express.js, Railway  
**Database:** MongoDB  
**AI:** Grok API  
**Other:** JWT Authentication, Puppeteer (PDF generation)

## 📁 Project Structure

```
interview-master/
├── Backend/          # Express API, auth, AI integration, PDF generation
└── Frontend/         # React client
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Grok API key

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/arishafarooqui/interview-master.git
   cd interview-master
   ```

2. Install dependencies for both Backend and Frontend
   ```bash
   cd Backend && npm install
   cd ../Frontend && npm install
   ```

3. Set up environment variables (create a `.env` file in `Backend/`)
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GROK_API_KEY=your_grok_api_key
   ```

4. Run the app
   ```bash
   # In Backend/
   npm start

   # In Frontend/
   npm run dev
   ```

## 👤 Author

**Areesha Farooqui**  
BSCS Student, Dawood University of Engineering and Technology (DUET)  
[GitHub](https://github.com/arishafarooqui) · [LinkedIn](https://linkedin.com/in/arisha-farooqui-062183369)

## 📄 License

This project is open for learning purposes. Please credit the original author if you reuse or build upon this work.
