import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Overview from './components/Overview';
import PredictChurn from './components/PredictChurn';
import About from './components/About';
import './App.css';

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('overview');
    else if (path === '/predict') setActiveTab('predict');
    else if (path === '/about') setActiveTab('about');
  }, [location]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo">N</div>
            <div className="header-text">
              <h1 className="app-title">Customer Churn Analytics</h1>
              <p className="app-subtitle">Predictive insights for customer retention.</p>
            </div>
          </div>
        </div>
        <nav className="nav-tabs">
          <Link 
            to="/" 
            className={activeTab === 'overview' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Link>
          <Link 
            to="/predict" 
            className={activeTab === 'predict' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setActiveTab('predict')}
          >
            Predict Churn
          </Link>
          <Link 
            to="/about" 
            className={activeTab === 'about' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setActiveTab('about')}
          >
            About
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/predict" element={<PredictChurn />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

