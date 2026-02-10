# WA_Fn-UseC_-Telco-Customer-Churn.csv

This CSV is the raw Telco customer churn dataset. It contains demographic, account, service, billing, and churn status for 7,043 customers. Downstream scripts use it for training and analytics.

```csv
customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,…,MonthlyCharges,TotalCharges,Churn  
7590-VHVEG,Female,0,Yes,No,1,No,…,29.85,29.85,No  
5575-GNVDE,Male,0,No,No,34,Yes,…,56.95,1889.5,No  
…  
```

Key columns:

- **customerID**: Unique customer identifier
- **Churn**: “Yes” or “No” label for churn outcome
- **MonthlyCharges**, **TotalCharges**: Billing metrics

---

# backend/WA_Fn-UseC_-Telco-Customer-Churn.csv

This backend copy of the dataset sits alongside the API and training scripts. The code loads it via relative paths. Data cleansing and encoding occur before model training and analytics.

---

# backend/requirements.txt

Defines Python dependencies for API and model training. Install with `pip install -r requirements.txt`.

```text
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
xgboost==2.0.3
joblib==1.3.2
python-multipart==0.0.6
pydantic==2.5.0
```

---

# backend/train_model.py

This script loads the CSV, preprocesses features, trains multiple models, and serializes the best performer along with metadata.

Key steps:

- Load data, handle missing `TotalCharges`, drop `customerID`.
- Label encode categorical features and target.
- Scale numerical features with `StandardScaler`.
- Train RandomForest, XGBoost, LogisticRegression via stratified 80/20 split.
- Select best model by F1 score; save artifacts:
- `models/model.pkl`
- `models/scaler.pkl`
- `models/label_encoders.pkl`
- `models/target_encoder.pkl`
- `models/feature_cols.json`, `metadata.json`, `feature_importance.json`.

```python
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import joblib, json, os

# Load & clean data
df = pd.read_csv(dataset_path)
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)

# Encode & split
categorical_cols = […]; numerical_cols = […]
label_encoders = {...}
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
y_train = …

# Train & choose best
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    …
    if f1 > best_f1:
        best_model = model

# Save artifacts
joblib.dump(best_model, 'models/model.pkl')
```

---

# backend/main.py

Implements a FastAPI server exposing churn prediction and analytics endpoints.

Structure:

- **CORS** enabled for all origins.
- **load_model()** loads serialized artifacts into global vars.
- **Pydantic models** define request (`CustomerData`) and response (`PredictionResponse`) schemas.
- Endpoints:
- `GET /` – root health message
- `GET /api/health` – health + model load status
- `POST /api/predict` – churn prediction for one customer
- `GET /api/analytics` – aggregate metrics, churn distributions, model metadata

```python
app = FastAPI(title="Customer Churn Prediction API")

@app.post("/api/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerData):
    # transform input, encode, scale, predict
    return {"churn": bool(...), "probability": ..., "risk_level": ...}

@app.get("/api/analytics")
def get_analytics():
    # load dataset, compute churn rates by contract, tenure, payment
    return {
      "total_customers": total_customers,
      "churn_rate": round(churn_rate,2),
      "model_metrics": metadata['metrics'],
      …
    }
```

---

## GET /

```api
{
    "title": "Root Endpoint",
    "description": "Returns a welcome message.",
    "method": "GET",
    "baseUrl": "http://localhost:8000",
    "endpoint": "/",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "none",
    "requestBody": "",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Welcome message",
            "body": "{\n  \"message\": \"Customer Churn Prediction API\"\n}"
        }
    }
}
```

---

## GET /api/health

```api
{
    "title": "Health Check",
    "description": "Returns API health and model load status.",
    "method": "GET",
    "baseUrl": "http://localhost:8000",
    "endpoint": "/api/health",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "none",
    "requestBody": "",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Health status",
            "body": "{\n  \"status\": \"healthy\",\n  \"model_loaded\": true\n}"
        }
    }
}
```

---

## POST /api/predict

```api
{
    "title": "Predict Churn",
    "description": "Predicts churn and returns probability and risk level.",
    "method": "POST",
    "baseUrl": "http://localhost:8000",
    "endpoint": "/api/predict",
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"gender\": \"Female\",\n  \"SeniorCitizen\": 0,\n  \"Partner\": \"Yes\",\n  \"Dependents\": \"No\",\n  \"tenure\": 12,\n  \"PhoneService\": \"Yes\",\n  \"MultipleLines\": \"No\",\n  \"InternetService\": \"DSL\",\n  \"OnlineSecurity\": \"No\",\n  \"OnlineBackup\": \"Yes\",\n  \"DeviceProtection\": \"No\",\n  \"TechSupport\": \"No\",\n  \"StreamingTV\": \"No\",\n  \"StreamingMovies\": \"No\",\n  \"Contract\": \"Month-to-month\",\n  \"PaperlessBilling\": \"Yes\",\n  \"PaymentMethod\": \"Electronic check\",\n  \"MonthlyCharges\": 29.85,\n  \"TotalCharges\": 348.95\n}",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Prediction result",
            "body": "{\n  \"churn\": false,\n  \"probability\": 14.23,\n  \"risk_level\": \"Low\"\n}"
        },
        "400": {
            "description": "Invalid input",
            "body": "{\n  \"detail\": \"Missing columns: [...]\"\n}"
        }
    }
}
```

---

## GET /api/analytics

```api
{
    "title": "Analytics",
    "description": "Returns aggregate churn metrics and feature importance.",
    "method": "GET",
    "baseUrl": "http://localhost:8000",
    "endpoint": "/api/analytics",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "none",
    "requestBody": "",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Analytics data",
            "body": "{\n  \"total_customers\": 7043,\n  \"churned\": 1869,\n  \"retained\": 5174,\n  \"churn_rate\": 26.54,\n  \"churn_by_contract\": { ... },\n  \"feature_importance\": { ... }\n}"
        }
    }
}
```

---

# frontend/public/index.html

The HTML template hosting the React app. It defines the root `<div>` for mounting and sets meta tags.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Customer Churn Analytics</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

---

# frontend/package.json

Lists JavaScript dependencies and scripts for the React frontend. Install via `npm install`.

```json
{
  "name": "churn-prediction-frontend",
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.3",
    "axios": "^1.6.2",
    "react-hot-toast": "^2.4.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

---

# frontend/src/index.js

Bootstraps React, wraps the app in a router and toast notifications.

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
    <Toaster position="bottom-right" />
  </BrowserRouter>
);
```

---

# frontend/src/App.js

Defines the app layout, header, and client-side routes. It highlights active tab via `useLocation`.

```javascript
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Overview from './components/Overview';
import PredictChurn from './components/PredictChurn';
import About from './components/About';

function App() {
  // manage active tab
  return (
    <header>…</header>
    <main>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/predict" element={<PredictChurn />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </main>
  );
}

export default App;
```

---

# frontend/src/components/About.js

Static page explaining customer churn, project goals, ML approach, and tech stack. It uses emoji icons and CSS for styling.

```jsx
<div className="about-container">
  <h2>What is Customer Churn?</h2>
  <p>Customer churn refers to the phenomenon…</p>
  <h2>Project Purpose & Approach</h2>
  <div className="approach-grid">
    <div className="approach-card">🎯 Objective</div>
    <div className="approach-card">🧠 Machine Learning</div>
    <div className="approach-card">📊 Data Insights</div>
  </div>
</div>
```

---

# frontend/src/components/Overview.js

Fetches analytics from `/api/analytics` and renders metrics and charts using Recharts. It handles loading and errors with toasts.

```jsx
import axios from 'axios';
import { PieChart, Pie, BarChart, LineChart } from 'recharts';

useEffect(() => fetchAnalytics(), []);
const fetchAnalytics = async () => {
  const { data } = await axios.get(`${API_URL}/api/analytics`);
  setAnalytics(data);
};

return (
  <div className="overview-container">
    {/* Key metrics */}
    {/* Pie, Bar, Line charts for churn distribution, contract, tenure, payment */}
  </div>
);
```

---

# frontend/src/components/PredictChurn.js

Displays a form to input customer features and calls `/api/predict`. It shows the prediction, probability, and risk badge.

```jsx
const [formData, setFormData] = useState({ … });
const handlePredict = async () => {
  const { data } = await axios.post(`${API_URL}/api/predict`, formData);
  setPrediction(data);
};

return (
  <div className="predict-container">
    {/* Input fields for each CustomerData prop */}
    <button onClick={handlePredict}>✈️ Predict Churn</button>
    {prediction && (
      <div className="prediction-result">
        <div>{prediction.churn ? 'Yes' : 'No'}</div>
        <div>{prediction.probability}%</div>
        <div className={`risk-badge ${prediction.risk_level.toLowerCase()}`}>
          {prediction.risk_level}
        </div>
      </div>
    )}
  </div>
);
```

---

This documentation covers each selected file, their roles, and interconnections: the CSV fuels both training and analytics, the backend trains and serves models via FastAPI, and the React frontend consumes these APIs to provide an interactive dashboard and prediction interface.