

WA_Fn-UseC_-Telco-Customer-Churn.csv
This CSV is the raw Telco customer churn dataset. It contains demographic, account, service, billing, and churn status for
7,043 customers. Downstream scripts use it for training and analytics.
Key columns:
customerID: Unique customer identifier
Churn: “Yes” or “No” label for churn outcome
MonthlyCharges, TotalCharges: Billing metrics
backend/WA_Fn-UseC_-Telco-Customer-Churn.csv
This backend copy of the dataset sits alongside the API and training scripts. The code loads it via relative paths. Data
cleansing and encoding occur before model training and analytics.
backend/requirements.txt
Defines Python dependencies for API and model training. Install with pip install -r requirements.txt.
backend/train_model.py
This script loads the CSV, preprocesses features, trains multiple models, and serializes the best performer along with
metadata.
Key steps:
Load data, handle missing TotalCharges, drop customerID.
Label encode categorical features and target.
Scale numerical features with StandardScaler.
Train RandomForest, XGBoost, LogisticRegression via stratified 80/20 split.
Select best model by F1 score; save artifacts:
1customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,��,MonthlyCharges,TotalCharges,Churn
27590-VHVEG,Female,0,Yes,No,1,No,��,29.85,29.85,No
35575-GNVDE,Male,0,No,No,34,Yes,��,56.95,1889.5,No
## 4...
## 1fastapi==0.104.1
## 2uvicorn==0.24.0
## 3pandas==2.1.3
## 4numpy==1.26.2
## 5scikit-learn==1.3.2
## 6xgboost==2.0.3
## 7joblib==1.3.2
## 8python-multipart==0.0.6
## 9pydantic==2.5.0

models/model.pkl
models/scaler.pkl
models/label_encoders.pkl
models/target_encoder.pkl
models/feature_cols.json, metadata.json, feature_importance.json.
backend/main.py
Implements a FastAPI server exposing churn prediction and analytics endpoints.
## Structure:
CORS enabled for all origins.
load_model() loads serialized artifacts into global vars.
Pydantic models define request (CustomerData) and response (PredictionResponse) schemas.
## Endpoints:
GET / – root health message
GET /api/health – health + model load status
POST /api/predict – churn prediction for one customer
GET /api/analytics – aggregate metrics, churn distributions, model metadata
1from sklearn.preprocessing import LabelEncoder, StandardScaler
2from sklearn.ensemble import RandomForestClassifier
3import xgboost as xgb
4import joblib, json, os
## 5
6# Load & clean data
7df = pd.read_csv(dataset_path)
8df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
9df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)
## 10
11# Encode & split
12categorical_cols = [...]; numerical_cols = [...]
## 13label_encoders = {...}
14scaler = StandardScaler()
15X_train_scaled = scaler.fit_transform(X_train)
## 16y_train = ...
## 17
18# Train & choose best
19for name, model in models.items():
20    model.fit(X_train_scaled, y_train)
## 21    ...
22    if f1 > best_f1:
23        best_model = model
## 24
25# Save artifacts
## 26joblib.dump(best_model, 'models/model.pkl')

## GET /
## Root Endpoint
Export to Postman
Returns a welcome message.
## GET
http://localhost:8000/
Code examples
## Responses
Welcome message
GET /api/health
## Health Check
Export to Postman
Returns API health and model load status.
## GET
http://localhost:8000/api/health
1app = FastAPI(title="Customer Churn Prediction API")
## 2
3@app.post("/api/predict", response_model=PredictionResponse)
4def predict_churn(customer: CustomerData):
5    # transform input, encode, scale, predict
6    return {"churn": bool(...), "probability": ..., "risk_level": ...}
## 7
## 8@app.get("/api/analytics")
9def get_analytics():
10    # load dataset, compute churn rates by contract, tenure, payment
11    return {
12      "total_customers": total_customers,
13      "churn_rate": round(churn_rate,2),
14      "model_metrics": metadata['metrics'],
## 15      ...
## 16    }
curl -X GET "http://localhost:8000/"
## {
"message": "Customer Churn Prediction API"
## }

Code examples
## Responses
Health status
POST /api/predict
## Predict Churn
Export to Postman
Predicts churn and returns probability and risk level.
## POST
http://localhost:8000/api/predict
## Headers
Content-Type
string • headerrequired
application/json
Request body
JSON payload required for this request.
curl -X GET "http://localhost:8000/api/health"
## {
## "status": "healthy",
"model_loaded": true
## }

Code examples
## Responses
## 200400
Prediction result
## {
"gender": "Female",
"SeniorCitizen": 0,
"Partner": "Yes",
"Dependents": "No",
## "tenure": 12,
"PhoneService": "Yes",
"MultipleLines": "No",
"InternetService": "DSL",
"OnlineSecurity": "No",
"OnlineBackup": "Yes",
"DeviceProtection": "No",
"TechSupport": "No",
"StreamingTV": "No",
"StreamingMovies": "No",
"Contract": "Month-to-month",
"PaperlessBilling": "Yes",
"PaymentMethod": "Electronic check",
"MonthlyCharges": 29.85,
"TotalCharges": 348.95
## }
curl -X POST "http://localhost:8000/api/predict" \
-H "Content-Type: application/json" \
-H "Content-Type: application/json" \
## -d '{
\"gender\": \"Female\",
\"SeniorCitizen\": 0,
\"Partner\": \"Yes\",
\"Dependents\": \"No\",
## \"tenure\": 12,
\"PhoneService\": \"Yes\",
\"MultipleLines\": \"No\",
\"InternetService\": \"DSL\",
\"OnlineSecurity\": \"No\",
\"OnlineBackup\": \"Yes\",
\"DeviceProtection\": \"No\",
\"TechSupport\": \"No\",
\"StreamingTV\": \"No\",
\"StreamingMovies\": \"No\",
\"Contract\": \"Month-to-month\",
\"PaperlessBilling\": \"Yes\",
\"PaymentMethod\": \"Electronic check\",
\"MonthlyCharges\": 29.85,
\"TotalCharges\": 348.95
## }'
## {
"churn": false,
## "probability": 14.23,
"risk_level": "Low"
## }

Invalid input
GET /api/analytics
## Analytics
Export to Postman
Returns aggregate churn metrics and feature importance.
## GET
http://localhost:8000/api/analytics
Code examples
## Responses
Analytics data
frontend/public/index.html
The HTML template hosting the React app. It defines the root <div> for mounting and sets meta tags.
## {
"detail": "Missing columns: [...]"
## }
curl -X GET "http://localhost:8000/api/analytics"
## {
## "total_customers": 7043,
## "churned": 1869,
## "retained": 5174,
## "churn_rate": 26.54,
## "churn_by_contract": { ... },
## "feature_importance": { ... }
## }

frontend/package.json
Lists JavaScript dependencies and scripts for the React frontend. Install via npm install.
frontend/src/index.js
Bootstraps React, wraps the app in a router and toast notifications.
1<!DOCTYPE html>
2<html lang="en">
## 3  <head>
4    <meta charset="utf-8" />
5    <meta name="viewport" content="width=device-width, initial-scale=1" />
6    <title>Customer Churn Analytics</title>
## 7  </head>
## 8  <body>
9    <noscript>You need to enable JavaScript to run this app.</noscript>
10    <div id="root"></div>
## 11  </body>
## 12</html>
## 1{
## 2  "name": "churn-prediction-frontend",
## 3  "dependencies": {
## 4    "react": "^18.2.0",
## 5    "react-router-dom": "^6.20.0",
## 6    "recharts": "^2.10.3",
## 7    "axios": "^1.6.2",
## 8    "react-hot-toast": "^2.4.1"
## 9  },
## 10  "scripts": {
11    "start": "react-scripts start",
12    "build": "react-scripts build"
## 13  }
## 14}
1import React from 'react';
2import ReactDOM from 'react-dom/client';
3import { BrowserRouter } from 'react-router-dom';
4import App from './App';
5import { Toaster } from 'react-hot-toast';
## 6
7const root = ReactDOM.createRoot(document.getElementById('root'));
## 8root.render(
9  <BrowserRouter>
10    <App />
11    <Toaster position="bottom-right" />
12  </BrowserRouter>
## 13);

frontend/src/App.js
Defines the app layout, header, and client-side routes. It highlights active tab via useLocation.
frontend/src/components/About.js
Static page explaining customer churn, project goals, ML approach, and tech stack. It uses emoji icons and CSS for styling.
frontend/src/components/Overview.js
Fetches analytics from /api/analytics and renders metrics and charts using Recharts. It handles loading and errors with
toasts.
1import { Routes, Route, Link, useLocation } from 'react-router-dom';
2import Overview from './components/Overview';
3import PredictChurn from './components/PredictChurn';
4import About from './components/About';
## 5
## 6function App() {
7  // manage active tab
8  return (
## 9    <header>...</header>
## 10    <main>
11      <Routes>
12        <Route path="/" element={<Overview />} />
13        <Route path="/predict" element={<PredictChurn />} />
14        <Route path="/about" element={<About />} />
15      </Routes>
## 16    </main>
## 17  );
## 18}
## 19
20export default App;
1<div className="about-container">
2  <h2>What is Customer Churn?</h2>
3  <p>Customer churn refers to the phenomenon...</p>
4  <h2>Project Purpose & Approach</h2>
5  <div className="approach-grid">
6    <div className="approach-card">  Objective</div>
7    <div className="approach-card">  Machine Learning</div>
8    <div className="approach-card">  Data Insights</div>
## 9  </div>
## 10</div>

frontend/src/components/PredictChurn.js
Displays a form to input customer features and calls /api/predict. It shows the prediction, probability, and risk badge.
This documentation covers each selected file, their roles, and interconnections: the CSV fuels both training and analytics,
the backend trains and serves models via FastAPI, and the React frontend consumes these APIs to provide an interactive
dashboard and prediction interface.
1import axios from 'axios';
2import { PieChart, Pie, BarChart, LineChart } from 'recharts';
## 3
4useEffect(() => fetchAnalytics(), []);
5const fetchAnalytics = async () => {
6  const { data } = await axios.get(`${API_URL}/api/analytics`);
7  setAnalytics(data);
## 8};
## 9
## 10return (
11  <div className="overview-container">
12    {/* Key metrics */}
13    {/* Pie, Bar, Line charts for churn distribution, contract, tenure, payment */}
## 14  </div>
## 15);
1const [formData, setFormData] = useState({ ... });
2const handlePredict = async () => {
3  const { data } = await axios.post(`${API_URL}/api/predict`, formData);
4  setPrediction(data);
## 5};
## 6
## 7return (
8  <div className="predict-container">
9    {/* Input fields for each CustomerData prop */}
10    <button onClick={handlePredict}>✈  Predict Churn</button>
## 11    {prediction && (
12      <div className="prediction-result">
13        <div>{prediction.churn ? 'Yes' : 'No'}</div>
## 14        <div>{prediction.probability}%</div>
15        <div className={`risk-badge ${prediction.risk_level.toLowerCase()}`}>
## 16          {prediction.risk_level}
## 17        </div>
## 18      </div>
## 19    )}
## 20  </div>
## 21);