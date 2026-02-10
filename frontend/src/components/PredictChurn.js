import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PredictChurn.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PredictChurn = () => {
  const [formData, setFormData] = useState({
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 1,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 50,
    TotalCharges: 50
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'SeniorCitizen' ? parseInt(value) : 
              name === 'tenure' || name === 'MonthlyCharges' || name === 'TotalCharges' ? 
              parseFloat(value) : value
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/predict`, formData);
      setPrediction(response.data);
      toast.success('Prediction generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      gender: 'Male',
      SeniorCitizen: 0,
      Partner: 'No',
      Dependents: 'No',
      tenure: 1,
      PhoneService: 'Yes',
      MultipleLines: 'No',
      InternetService: 'DSL',
      OnlineSecurity: 'No',
      OnlineBackup: 'No',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'No',
      StreamingMovies: 'No',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 50,
      TotalCharges: 50
    });
    setPrediction(null);
    toast.success('Form reset');
  };

  return (
    <div className="predict-container fade-in">
      <div className="card">
        <h2 className="section-title">Predict Customer Churn</h2>
        <p className="section-subtitle">Enter customer details to predict churn probability</p>

        <div className="form-section">
          <h3 className="form-section-title">Demographics</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Senior Citizen</label>
              <select 
                name="SeniorCitizen" 
                value={formData.SeniorCitizen} 
                onChange={handleChange}
                className="form-select"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Has Partner</label>
              <select 
                name="Partner" 
                value={formData.Partner} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Has Dependents</label>
              <select 
                name="Dependents" 
                value={formData.Dependents} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tenure (months)</label>
              <input 
                type="number" 
                name="tenure" 
                value={formData.tenure} 
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <h3 className="form-section-title">Services</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone Service</label>
              <select 
                name="PhoneService" 
                value={formData.PhoneService} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Multiple Lines</label>
              <select 
                name="MultipleLines" 
                value={formData.MultipleLines} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No phone service">No phone service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Internet Service</label>
              <select 
                name="InternetService" 
                value={formData.InternetService} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="DSL">DSL</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Online Security</label>
              <select 
                name="OnlineSecurity" 
                value={formData.OnlineSecurity} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Online Backup</label>
              <select 
                name="OnlineBackup" 
                value={formData.OnlineBackup} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Device Protection</label>
              <select 
                name="DeviceProtection" 
                value={formData.DeviceProtection} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tech Support</label>
              <select 
                name="TechSupport" 
                value={formData.TechSupport} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Streaming TV</label>
              <select 
                name="StreamingTV" 
                value={formData.StreamingTV} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Streaming Movies</label>
              <select 
                name="StreamingMovies" 
                value={formData.StreamingMovies} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>
          </div>

          <h3 className="form-section-title">Billing Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Contract Type</label>
              <select 
                name="Contract" 
                value={formData.Contract} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Paperless Billing</label>
              <select 
                name="PaperlessBilling" 
                value={formData.PaperlessBilling} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                name="PaymentMethod" 
                value={formData.PaymentMethod} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Charges ($)</label>
              <input 
                type="number" 
                name="MonthlyCharges" 
                value={formData.MonthlyCharges} 
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Charges ($)</label>
              <input 
                type="number" 
                name="TotalCharges" 
                value={formData.TotalCharges} 
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={handlePredict} 
              className="btn btn-primary"
              disabled={loading}
            >
              ✈️ Predict Churn
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {prediction && (
          <div className="prediction-result">
            <h3 className="section-title">Prediction Result</h3>
            <div className="prediction-label">Will Customer Churn?</div>
            <div className={`prediction-value ${prediction.churn ? 'churned' : 'retained'}`}>
              {prediction.churn ? 'Yes' : 'No'}
            </div>
            <div className="prediction-label">Churn Probability</div>
            <div className="probability-value">{prediction.probability}%</div>
            <div className="prediction-label">Risk Level</div>
            <div className={`risk-badge ${prediction.risk_level.toLowerCase()}`}>
              {prediction.risk_level}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictChurn;

