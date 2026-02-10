import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import './Overview.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const COLORS = {
  churned: '#FF6B6B',
  retained: '#51CF66',
  primary: '#4A90E2'
};

const Overview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics`);
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load data</div>;
  }

  // Prepare data for charts
  const churnDistribution = [
    { name: 'Retained', value: analytics.retained, fill: COLORS.retained },
    { name: 'Churned', value: analytics.churned, fill: COLORS.churned }
  ];

  const contractData = Object.entries(analytics.churn_by_contract).map(([contract, data]) => ({
    contract,
    churned: data.churned,
    retained: data.retained
  }));

  const tenureData = Object.entries(analytics.churn_by_tenure).map(([tenure, data]) => ({
    tenure,
    churned: data.churned,
    customers: data.customers
  }));

  const paymentData = Object.entries(analytics.payment_methods).map(([method, count]) => ({
    method: method.replace(' (automatic)', ''),
    count
  }));

  const featureImportance = Object.entries(analytics.feature_importance || {})
    .slice(0, 10)
    .map(([feature, importance]) => ({
      feature: feature.replace(/([A-Z])/g, ' $1').trim(),
      importance: importance * 100
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="overview-container fade-in">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(74, 144, 226, 0.2)' }}>
            👥
          </div>
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{analytics.total_customers.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(255, 107, 107, 0.2)' }}>
            📉
          </div>
          <div className="metric-label">Churned</div>
          <div className="metric-value" style={{ color: COLORS.churned }}>
            {analytics.churned.toLocaleString()}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(81, 207, 102, 0.2)' }}>
            📈
          </div>
          <div className="metric-label">Retained</div>
          <div className="metric-value" style={{ color: COLORS.retained }}>
            {analytics.retained.toLocaleString()}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(255, 184, 77, 0.2)' }}>
            ⚠️
          </div>
          <div className="metric-label">Churn Rate</div>
          <div className="metric-value" style={{ color: '#FFB84D' }}>
            {analytics.churn_rate}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title">
            <span>🎯</span> Churn Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {churnDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Churn by Contract Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contractData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="contract" stroke="#B0B8C4" />
              <YAxis stroke="#B0B8C4" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 31, 58, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="retained" fill={COLORS.retained} name="Retained" />
              <Bar dataKey="churned" fill={COLORS.churned} name="Churned" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Churn by Tenure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="tenure" stroke="#B0B8C4" />
              <YAxis stroke="#B0B8C4" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 31, 58, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="churned" stroke={COLORS.churned} name="Churned" strokeWidth={2} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="customers" stroke={COLORS.primary} name="Customers" strokeWidth={2} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" stroke="#B0B8C4" />
              <YAxis dataKey="method" type="category" stroke="#B0B8C4" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 31, 58, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="count" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">
            <span>🧠</span> Top Feature Importance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" stroke="#B0B8C4" />
              <YAxis dataKey="feature" type="category" stroke="#B0B8C4" width={150} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 31, 58, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="importance" fill="#9B59B6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Model Performance Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-item-label">Model:</span>
              <span className="metric-item-value" style={{ color: COLORS.primary }}>
                {analytics.model_name}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-item-label">Accuracy:</span>
              <span className="metric-item-value">{(analytics.model_metrics.accuracy * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item-label">Precision:</span>
              <span className="metric-item-value">{(analytics.model_metrics.precision * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item-label">Recall:</span>
              <span className="metric-item-value">{(analytics.model_metrics.recall * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item-label">F1 Score:</span>
              <span className="metric-item-value">{(analytics.model_metrics.f1 * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item-label">ROC-AUC:</span>
              <span className="metric-item-value">{(analytics.model_metrics.roc_auc * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

