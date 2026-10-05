# MatraCare AI: Maternal Health Risk Prediction & Guidance Platform

Production-ready web application for maternal health risk prediction, personalized nutrition recommendations, clinical decision support, and AI-powered patient education.

---

## 1. System Overview & Architecture

MatraCare AI bridges predictive machine learning with maternal-fetal clinical practice:
- **Gestational Diabetes Mellitus (GDM) Risk Estimator**: Statistical classifier trained on the PIMA Indian Diabetes cohort and antenatal glucose markers (Fasting blood sugar, 2h post-prandial glucose, pre-pregnancy BMI, maternal age, parity, family pedigree).
- **Cervical Dysplasia / Neoplasia Risk Predictor**: Multi-factor model grounded in WHO & Cervical Risk Factor datasets (high-risk HPV DNA status, cytology history, smoking pack-years, sexual history, oral contraceptive duration, STDs).
- **Personalized Nutrition Recommendation Engine**: Calculates daily caloric targets (BMR + trimester adjustments) and 7-day meal plans adhering to low-glycemic index (GI) and high-bioavailable iron protocols.
- **AI Healthcare Chatbot**: Integrated with Google Gemini (`gemini-3.8-flash`) with constrained clinical guardrails, grounding context, and educational disclaimers.
- **Role-Based Portals**:
  - **Patient Dashboard**: Risk gauges, longitudinal glucose & blood pressure trend charts, nutritional schedule, and downloadable clinical health reports (PDF).
  - **Doctor Dashboard**: Patient cohort list with risk stratification, patient drill-downs, model explainability (odds ratios / feature contributions), clinical notes entry, and dietary approval.
  - **Admin & MLOps Portal**: System metrics, model versioning (`v1.2.4-GDM`, `v1.1.8-CC`), online retraining workflow with CSV upload, user role management, and security audit logs.

---

## 2. Tech Stack

- **Frontend**: React 19 (TypeScript), Tailwind CSS, Custom SVG Visualizations & Gauges, jsPDF (client-side PDF generation), Lucide Icons.
- **Backend**: Node.js & Express (TypeScript), RESTful API endpoints.
- **Machine Learning**: Standardized Logistic Regression & Decision Scorer with model versioning, feature contribution weights, and validation metrics (Accuracy, ROC-AUC, Precision, Recall, F1).
- **AI Integration**: Google GenAI SDK (`@google/genai`) accessing `gemini-3.8-flash` with system prompt guardrails.
- **Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml`.

---

## 3. Pre-Seeded Clinical Profiles for Testing

The application includes an interactive **Demo Switcher Bar** at the top of the interface:
1. **Priya Patel (Patient - Gestational Week 24)**: G2P1 with borderline elevated post-prandial glucose (142 mg/dL) and active nutrition plan.
2. **Sunita Rao (Patient - Cervical Screening Focus)**: Referred after positive HPV 16 and low-grade squamous intraepithelial lesion (LSIL).
3. **Dr. Ananya Sharma, MD (Doctor - Maternal-Fetal Medicine)**: Clinician dashboard reviewing patient cohorts, approving dietary protocols, and entering clinical notes.
4. **Dr. Vikram Malhotra (Admin)**: System administrator supervising model accuracy, retraining pipelines, and user role assignments.

---

## 4. API Endpoints

### Authentication
- `POST /api/auth/register`: Create user (email, password, role)
- `POST /api/auth/login`: Authenticate and receive session token
- `GET /api/auth/me`: Retrieve current authenticated profile
- `POST /api/auth/switch-demo`: Fast role switching for testing

### Patients & Clinical Records
- `GET /api/patients`: List assigned patients with risk badges
- `GET /api/patients/:id`: Retrieve patient drill-down with longitudinal records
- `POST /api/patients/:id/notes`: Add clinical note and action items
- `GET /api/health-records/:userId`: Fetch longitudinal vitals & lab data
- `POST /api/health-records`: Submit new vitals entry (triggers live model re-calculation)

### AI Risk Predictions
- `POST /api/predict/gestational-diabetes`: Calculate GDM probability and feature contributions
- `POST /api/predict/cervical-cancer`: Calculate Cervical Cancer probability and feature contributions
- `GET /api/predictions/:userId`: Retrieve latest saved risk predictions

### Nutrition & Chat
- `GET /api/nutrition/:userId`: Fetch 7-day personalized meal plan
- `POST /api/nutrition/generate`: Regenerate meal plan based on dietary preference
- `PUT /api/nutrition/:userId/approval`: Clinician approval or modification
- `POST /api/chat`: Send query to MatraCare AI with patient context
- `GET /api/chat/history/:userId`: Retrieve conversation history

### Admin & MLOps
- `GET /api/admin/stats`: Total users, query count, model versions
- `GET /api/admin/users`: User management list
- `PUT /api/admin/users/:id/role`: Update user role
- `GET /api/admin/logs`: Access security audit logs
- `GET /api/ml/metrics`: View model versions, ROC-AUC, precision, feature weights
- `POST /api/ml/train`: Upload CSV or trigger retraining pipeline

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js 20+ installed
- NPM 10+

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your_api_key_here"
PORT=3000
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building & Running Production Container
```bash
docker-compose up --build -d
```

---

## 6. Clinical & Regulatory Disclaimers

1. **Educational & Decision-Support Only**: All predictions, recommendations, and chatbot outputs are for educational risk stratification and must be confirmed by a licensed medical practitioner.
2. **Guideline Alignment**: Incorporates standard thresholds from the World Health Organization (WHO), American College of Obstetricians and Gynecologists (ACOG), and Federation of Obstetric & Gynaecological Societies of India (FOGSI).
3. **Data Security**: Designed with HIPAA and DISA compliance principles, role-based access control (RBAC), and audit logging.
