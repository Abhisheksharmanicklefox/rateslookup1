# Frontend Integration Guide

## Overview
This guide shows you how to integrate your frontend with the RatesLookup backend API.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Form Integration](#form-integration)
3. [React Examples](#react-examples)
4. [Vue Examples](#vue-examples)
5. [Vanilla JavaScript](#vanilla-javascript)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Quick Start

### Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';

const apiClient = {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }
    
    return data;
  },
  
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};
```

---

## Form Integration

### "Secure your best rate today" Form

#### HTML Structure
```html
<form id="leadCaptureForm">
  <div class="form-group">
    <label for="firstName">First Name *</label>
    <input 
      type="text" 
      id="firstName" 
      name="first_name" 
      required 
      maxlength="100"
    />
    <span class="error" id="firstNameError"></span>
  </div>
  
  <div class="form-group">
    <label for="email">Email *</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required
    />
    <span class="error" id="emailError"></span>
  </div>
  
  <div class="form-group">
    <label for="phone">Phone Number</label>
    <input 
      type="tel" 
      id="phone" 
      name="phone"
      placeholder="(555) 123-4567"
    />
    <span class="error" id="phoneError"></span>
  </div>
  
  <button type="submit" id="submitBtn">
    Secure the rate
  </button>
  
  <div id="successMessage" class="success" style="display: none;">
    Thank you! We'll contact you shortly.
  </div>
</form>
```

#### JavaScript Implementation
```javascript
document.getElementById('leadCaptureForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
  
  // Get form data
  const formData = {
    first_name: document.getElementById('firstName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    source: 'website',
    // Capture UTM parameters from URL
    utm_source: new URLSearchParams(window.location.search).get('utm_source'),
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
    utm_content: new URLSearchParams(window.location.search).get('utm_content'),
    utm_term: new URLSearchParams(window.location.search).get('utm_term'),
    referrer_url: document.referrer
  };
  
  // Disable submit button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    const response = await apiClient.post('/leads', formData);
    
    // Success!
    console.log('Lead created:', response.data);
    
    // Show success message
    document.getElementById('successMessage').style.display = 'block';
    
    // Reset form
    e.target.reset();
    
    // Optional: Redirect to thank you page
    // window.location.href = '/thank-you';
    
    // Optional: Track conversion
    if (window.gtag) {
      gtag('event', 'lead_capture', {
        'event_category': 'engagement',
        'event_label': 'website_form'
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    // Handle validation errors
    if (error.message.includes('validation')) {
      // Display field-specific errors
      // (You'll need to parse error.details from the API response)
      alert('Please check your input and try again.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Secure the rate';
  }
});
```

---

## React Examples

### Lead Capture Form Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Capture UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      const payload = {
        ...formData,
        source: 'website',
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        referrer_url: document.referrer
      };
      
      const response = await axios.post(`${API_BASE_URL}/leads`, payload);
      
      console.log('Lead created:', response.data);
      
      // Success!
      setSuccess(true);
      setFormData({ first_name: '', email: '', phone: '' });
      
      // Track conversion
      if (window.gtag) {
        window.gtag('event', 'lead_capture', {
          event_category: 'engagement',
          event_label: 'website_form'
        });
      }
      
      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        // window.location.href = '/thank-you';
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response?.data?.error?.details) {
        // Handle validation errors
        const fieldErrors = {};
        error.response.data.error.details.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error?.message || 'Something went wrong' 
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="success-message">
        <h2>Thank you!</h2>
        <p>We'll contact you shortly with the best rates.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="lead-capture-form">
      <h2>Secure your best rate today</h2>
      
      {errors.general && (
        <div className="alert alert-error">{errors.general}</div>
      )}
      
      <div className="form-group">
        <label htmlFor="first_name">First Name *</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          maxLength={100}
          className={errors.first_name ? 'error' : ''}
        />
        {errors.first_name && (
          <span className="error-message">{errors.first_name}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && (
          <span className="error-message">{errors.phone}</span>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Submitting...' : 'Secure the rate'}
      </button>
    </form>
  );
}

export default LeadCaptureForm;
```

### Custom Hook for API Calls

```jsx
// hooks/useApi.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        ...options,
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const get = useCallback((endpoint) => {
    return request(endpoint, { method: 'GET' });
  }, [request]);
  
  const post = useCallback((endpoint, data) => {
    return request(endpoint, { method: 'POST', data });
  }, [request]);
  
  const patch = useCallback((endpoint, data) => {
    return request(endpoint, { method: 'PATCH', data });
  }, [request]);
  
  const del = useCallback((endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  }, [request]);
  
  return { loading, error, get, post, patch, delete: del };
}

// Usage in component
function MyComponent() {
  const api = useApi();
  
  const handleSubmit = async (data) => {
    try {
      const result = await api.post('/leads', data);
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      {api.loading && <p>Loading...</p>}
      {api.error && <p>Error: {api.error}</p>}
      {/* Your form here */}
    </div>
  );
}
```

---
