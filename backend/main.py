from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import joblib
import json
from pydantic import BaseModel
from typing import Optional, List, Dict
import os

app = FastAPI(title="Customer Churn Prediction API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessing objects
model = None
scaler = None
label_encoders = None
target_encoder = None
feature_cols = None

def load_model():
    global model, scaler, label_encoders, target_encoder, feature_cols
    try:
        model = joblib.load('models/model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        label_encoders = joblib.load('models/label_encoders.pkl')
        target_encoder = joblib.load('models/target_encoder.pkl')
        with open('models/feature_cols.json', 'r') as f:
            feature_cols = json.load(f)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

load_model()

# Request models
class CustomerData(BaseModel):
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: float

class PredictionResponse(BaseModel):
    churn: bool
    probability: float
    risk_level: str

@app.get("/")
def read_root():
    return {"message": "Customer Churn Prediction API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/api/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerData):
    try:
        # Create DataFrame
        data = {
            'gender': [customer.gender],
            'SeniorCitizen': [customer.SeniorCitizen],
            'Partner': [customer.Partner],
            'Dependents': [customer.Dependents],
            'tenure': [customer.tenure],
            'PhoneService': [customer.PhoneService],
            'MultipleLines': [customer.MultipleLines],
            'InternetService': [customer.InternetService],
            'OnlineSecurity': [customer.OnlineSecurity],
            'OnlineBackup': [customer.OnlineBackup],
            'DeviceProtection': [customer.DeviceProtection],
            'TechSupport': [customer.TechSupport],
            'StreamingTV': [customer.StreamingTV],
            'StreamingMovies': [customer.StreamingMovies],
            'Contract': [customer.Contract],
            'PaperlessBilling': [customer.PaperlessBilling],
            'PaymentMethod': [customer.PaymentMethod],
            'MonthlyCharges': [customer.MonthlyCharges],
            'TotalCharges': [customer.TotalCharges]
        }
        
        df = pd.DataFrame(data)
        
        # Encode categorical variables
        for col in label_encoders.keys():
            if col in df.columns:
                # Handle unseen categories
                try:
                    df[col] = label_encoders[col].transform(df[col])
                except ValueError:
                    # If category not seen during training, use most frequent
                    df[col] = 0
        
        # Select features in correct order
        X = df[feature_cols]
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0][1]
        
        # Determine risk level
        if probability < 0.3:
            risk_level = "LOW"
        elif probability < 0.6:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
        
        churn = bool(prediction)
        
        return PredictionResponse(
            churn=churn,
            probability=round(probability * 100, 2),
            risk_level=risk_level
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/predict-batch")
def predict_batch(file: UploadFile = File(...)):
    try:
        # Read CSV file
        df = pd.read_csv(file.file)
        
        # Check required columns
        required_cols = ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
                        'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
                        'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
                        'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
                        'MonthlyCharges', 'TotalCharges']
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_cols}")
        
        # Handle missing values
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
        df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)
        
        # Encode categorical variables
        df_encoded = df.copy()
        for col in label_encoders.keys():
            if col in df_encoded.columns:
                try:
                    df_encoded[col] = label_encoders[col].transform(df_encoded[col])
                except ValueError:
                    df_encoded[col] = 0
        
        # Select features
        X = df_encoded[feature_cols]
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Predict
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)[:, 1]
        
        # Add predictions to dataframe
        df['Churn_Prediction'] = predictions
        df['Churn_Probability'] = probabilities
        
        # Return results
        results = df.to_dict('records')
        return {"predictions": results, "count": len(results)}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/analytics")
def get_analytics():
    try:
        # Load original dataset
        dataset_path = os.path.join(os.path.dirname(__file__), 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
        if not os.path.exists(dataset_path):
            dataset_path = os.path.join(os.path.dirname(__file__), '..', 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
        df = pd.read_csv(dataset_path)
        
        # Handle missing values
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
        df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)
        
        # Calculate metrics
        total_customers = len(df)
        churned = len(df[df['Churn'] == 'Yes'])
        retained = len(df[df['Churn'] == 'No'])
        churn_rate = (churned / total_customers) * 100
        
        # Churn by contract type
        churn_by_contract = df.groupby(['Contract', 'Churn']).size().reset_index(name='count')
        contract_data = {}
        for contract in df['Contract'].unique():
            contract_data[contract] = {
                'churned': int(churn_by_contract[(churn_by_contract['Contract'] == contract) & 
                                                  (churn_by_contract['Churn'] == 'Yes')]['count'].sum()),
                'retained': int(churn_by_contract[(churn_by_contract['Contract'] == contract) & 
                                                   (churn_by_contract['Churn'] == 'No')]['count'].sum())
            }
        
        # Churn by tenure groups
        df['TenureGroup'] = pd.cut(df['tenure'], 
                                   bins=[0, 12, 24, 48, float('inf')],
                                   labels=['0-12 months', '12-24 months', '24-48 months', '48+ months'])
        churn_by_tenure = df.groupby(['TenureGroup', 'Churn']).size().reset_index(name='count')
        tenure_data = {}
        for tenure in df['TenureGroup'].unique():
            if pd.notna(tenure):
                tenure_data[str(tenure)] = {
                    'churned': int(churn_by_tenure[(churn_by_tenure['TenureGroup'] == tenure) & 
                                                  (churn_by_tenure['Churn'] == 'Yes')]['count'].sum()),
                    'customers': int(churn_by_tenure[churn_by_tenure['TenureGroup'] == tenure]['count'].sum())
                }
        
        # Payment methods distribution
        payment_dist = df['PaymentMethod'].value_counts().to_dict()
        
        # Load model metadata
        with open('models/metadata.json', 'r') as f:
            metadata = json.load(f)
        
        # Load feature importance
        with open('models/feature_importance.json', 'r') as f:
            feature_importance = json.load(f)
        
        return {
            "total_customers": total_customers,
            "churned": churned,
            "retained": retained,
            "churn_rate": round(churn_rate, 2),
            "churn_by_contract": contract_data,
            "churn_by_tenure": tenure_data,
            "payment_methods": payment_dist,
            "model_metrics": metadata['metrics'],
            "model_name": metadata['model_name'],
            "feature_importance": feature_importance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

