import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import xgboost as xgb
import joblib
import json
import os

# Load the dataset
print("Loading dataset...")
dataset_path = os.path.join(os.path.dirname(__file__), 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
if not os.path.exists(dataset_path):
    dataset_path = os.path.join(os.path.dirname(__file__), '..', 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
df = pd.read_csv(dataset_path)

# Handle missing values
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)

# Drop customerID
df = df.drop('customerID', axis=1)

# Encode target variable
le_churn = LabelEncoder()
df['Churn'] = le_churn.fit_transform(df['Churn'])

# Prepare features
categorical_cols = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines',
                    'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
                    'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract',
                    'PaperlessBilling', 'PaymentMethod']

numerical_cols = ['SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges']

# Label encode categorical variables
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Select features
feature_cols = categorical_cols + numerical_cols
X = df[feature_cols]
y = df['Churn']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train multiple models
models = {
    'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10),
    'XGBoost': xgb.XGBClassifier(random_state=42, max_depth=6, n_estimators=100),
    'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000)
}

best_model = None
best_f1 = 0
best_model_name = None
results = {}

print("Training models...")
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    results[name] = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc
    }
    
    print(f"{name}: F1={f1:.4f}, Accuracy={accuracy:.4f}, ROC-AUC={roc_auc:.4f}")
    
    if f1 > best_f1:
        best_f1 = f1
        best_model = model
        best_model_name = name

print(f"\nBest model: {best_model_name} with F1 score: {best_f1:.4f}")

# Save the best model and preprocessing objects
os.makedirs('models', exist_ok=True)
joblib.dump(best_model, 'models/model.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(label_encoders, 'models/label_encoders.pkl')
joblib.dump(le_churn, 'models/target_encoder.pkl')

# Save feature names and order
with open('models/feature_cols.json', 'w') as f:
    json.dump(feature_cols, f)

# Save model metadata
metadata = {
    'model_name': best_model_name,
    'metrics': results[best_model_name],
    'feature_cols': feature_cols
}

with open('models/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

# Calculate feature importance
if hasattr(best_model, 'feature_importances_'):
    feature_importance = dict(zip(feature_cols, best_model.feature_importances_))
elif hasattr(best_model, 'coef_'):
    # For LogisticRegression, use absolute coefficients
    feature_importance = dict(zip(feature_cols, np.abs(best_model.coef_[0])))
else:
    feature_importance = {}

# Sort by importance
feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10])

with open('models/feature_importance.json', 'w') as f:
    json.dump(feature_importance, f, indent=2)

print(f"\nModel saved successfully!")
print(f"Model: {best_model_name}")
print(f"Metrics: {results[best_model_name]}")

