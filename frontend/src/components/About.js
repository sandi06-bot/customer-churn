import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container fade-in">
      <div className="card">
        <h2 className="section-title">What is Customer Churn?</h2>
        <p className="about-text">
          Customer churn refers to the phenomenon where customers stop doing business with a company 
          or discontinue their subscription to a service. In the telecommunications industry, churn 
          represents a critical business metric as acquiring new customers is significantly more expensive 
          than retaining existing ones.
        </p>
        <p className="about-text">
          Understanding and predicting churn allows businesses to proactively identify at-risk customers 
          and implement targeted retention strategies, ultimately improving customer lifetime value and 
          reducing acquisition costs.
        </p>
      </div>

      <h2 className="section-title">Project Purpose & Approach</h2>
      <div className="approach-grid">
        <div className="approach-card">
          <div className="approach-icon" style={{ background: 'rgba(74, 144, 226, 0.2)' }}>
            🎯
          </div>
          <h3 className="approach-title">Objective</h3>
          <p className="approach-text">
            Build a predictive model to identify customers at risk of churning, enabling proactive 
            retention strategies.
          </p>
        </div>

        <div className="approach-card">
          <div className="approach-icon" style={{ background: 'rgba(155, 89, 182, 0.2)' }}>
            🧠
          </div>
          <h3 className="approach-title">Machine Learning</h3>
          <p className="approach-text">
            The system trains and evaluates multiple ML models (Random Forest, XGBoost, Logistic Regression) 
            and selects the best performer.
          </p>
        </div>

        <div className="approach-card">
          <div className="approach-icon" style={{ background: 'rgba(81, 207, 102, 0.2)' }}>
            📊
          </div>
          <h3 className="approach-title">Data Insights</h3>
          <p className="approach-text">
            Comprehensive visualizations reveal patterns in customer behavior, contract types, service usage, 
            and demographic factors.
          </p>
        </div>

        <div className="approach-card">
          <div className="approach-icon" style={{ background: 'rgba(255, 184, 77, 0.2)' }}>
            ⚡
          </div>
          <h3 className="approach-title">Real-time Predictions</h3>
          <p className="approach-text">
            Input customer data through an intuitive form to receive instant churn predictions with probability 
            scores and risk levels.
          </p>
        </div>
      </div>

      <h2 className="section-title">Model Architecture & Performance</h2>
      <div className="card">
        <h3 className="card-title">Selected Model</h3>
        <p className="about-text">
          <strong style={{ color: '#4A90E2' }}>LogisticRegression</strong> - Chosen based on superior F1 score 
          performance across all evaluated models.
        </p>

        <h3 className="card-title" style={{ marginTop: '2rem' }}>Data Processing</h3>
        <ul className="info-list">
          <li>Feature engineering with label encoding for categorical variables</li>
          <li>StandardScaler normalization for numerical features</li>
          <li>Stratified train-test split (80/20) to maintain class distribution</li>
          <li>Total dataset: 7,043 customer records</li>
        </ul>

        <h3 className="card-title" style={{ marginTop: '2rem' }}>Key Features Analyzed</h3>
        <p className="about-text">
          The model considers 19 features including demographics (gender, senior citizen status), account 
          information (tenure, contract type), services (internet, phone, streaming), and billing data 
          (monthly charges, payment method).
        </p>

        <h3 className="card-title" style={{ marginTop: '2rem' }}>Business Impact</h3>
        <p className="about-text">
          With a churn rate of 26.54% in the dataset, accurate predictions enable targeted interventions 
          that can significantly reduce customer attrition and increase revenue retention.
        </p>

        <h3 className="card-title" style={{ marginTop: '2rem' }}>Technology Stack</h3>
        <div className="tech-stack">
          <div className="tech-item">
            <div className="tech-name">Python</div>
            <div className="tech-role">Backend</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">FastAPI</div>
            <div className="tech-role">API Framework</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">scikit-learn</div>
            <div className="tech-role">ML Library</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">XGBoost</div>
            <div className="tech-role">ML Library</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">React</div>
            <div className="tech-role">Frontend</div>
          </div>
          <div className="tech-item">
            <div className="tech-name">Recharts</div>
            <div className="tech-role">Visualization</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

