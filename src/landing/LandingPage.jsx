import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">R</div>
          RMA Flow
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">Next-Gen Service Management</div>
        <h1 className="landing-title">
          Streamline Your Return <br /> Management Process
        </h1>
        <p className="landing-subtitle">
          RMA Flow is a state-of-the-art platform designed to simplify tracking, vendor communication, and customer updates for all your service tickets.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <Zap size={24} />
          </div>
          <h3>Lightning Fast Workflow</h3>
          <p>Advance tickets through stages with a single click. Keep track of customer inwards, vendor dispatch, and resolutions instantly.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <ShieldCheck size={24} />
          </div>
          <h3>Secure & Reliable</h3>
          <p>Your data is protected with enterprise-grade security. Track every physical asset and visual proof securely.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <BarChart3 size={24} />
          </div>
          <h3>Comprehensive Reporting</h3>
          <p>Generate detailed PDF reports and send automated WhatsApp updates directly to customers the moment their service is complete.</p>
        </div>
      </section>
    </div>
  );
}
