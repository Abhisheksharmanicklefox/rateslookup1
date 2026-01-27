# RatesLookup API - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Leads API](#leads-api)
8. [Applications API](#applications-api)
9. [OTP API](#otp-api)
10. [Progress API](#progress-api)
11. [Rates API](#rates-api)
12. [Callbacks API](#callbacks-api)
13. [Explore Rates API](#explore-rates-api)
14. [Tools API](#tools-api)
15. [Analytics API](#analytics-api)
16. [FAQs API](#faqs-api)
17. [Testimonials API](#testimonials-api)
18. [Myths API](#myths-api)

---

## Overview

The RatesLookup API is a RESTful API for managing mortgage rate lookups, applications, and lead capture.

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api/v1`  
**Protocol:** HTTP/HTTPS  
**Data Format:** JSON

### Key Features
- Lead capture with UTM tracking
- Mortgage application management
- OTP verification system
- Rate calculation engine
- Progress tracking
- Analytics and reporting

---

## Authentication

Currently, the API does not require authentication for public endpoints.
Future versions will implement JWT-based authentication for protected routes.

---

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...],
    "timestamp": "2026-01-27T19:43:21.826Z",
    "requestId": "unique-id"
  }
}
```

---

## Error Handling

### Error Types
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND_ERROR` - Resource not found
- `DATABASE_ERROR` - Database operation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `AUTHORIZATION_ERROR` - Access denied
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `BUSINESS_LOGIC_ERROR` - Business rule violation

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

### General API
- **Window:** 15 minutes
- **Max Requests:** 100

### OTP Endpoints
- **Window:** 5 minutes
- **Max Requests:** 5

### Lead Capture
- **Window:** 5 minutes
- **Max Requests:** 5

### Application Creation
- **Window:** 1 hour
- **Max Requests:** 10

---

## Leads API

### Overview
The Leads API manages lead capture with UTM tracking and conversion analytics.

### Endpoints

#### 1. Create Lead
Capture a new lead from your website form.

**Endpoint:** `POST /api/v1/leads`

**Request Body:**
```json
{
  "first_name": "John",
  "email": "john@example.com",
  "phone": "1234567890",
  "source": "website",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "mortgage_rates",
  "utm_content": "banner_ad",
  "utm_term": "best mortgage rates",
  "referrer_url": "https://google.com"
}
```

**Required Fields:**
- `first_name` (string, 1-100 chars)
- `email` (string, valid email)

**Optional Fields:**
- `phone` (string, valid phone number)
- `source` (enum: website, landing_page, social_media, referral, advertisement, organic_search, paid_search, email_campaign, other)
- `utm_source` (string, max 255 chars)
- `utm_medium` (string, max 255 chars)
- `utm_campaign` (string, max 255 chars)
- `utm_content` (string, max 255 chars)
- `utm_term` (string, max 255 chars)
- `referrer_url` (string, valid URL)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "data": {
    "id": "f3e4741d-98db-484c-bf15-68f03b0ea6cc",
    "first_name": "John",
    "email": "john@example.com",
    "phone": "+11234567890",
    "source": "website",
    "converted_to_application": false,
    "created_at": "2026-01-27T19:43:21.826Z"
  }
}
```

**Example (JavaScript):**
```javascript
fetch('http://localhost:3000/api/v1/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    email: 'john@example.com',
    phone: '1234567890',
    source: 'website'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

---

#### 2. Get All Leads
Retrieve all leads with filtering and pagination.

**Endpoint:** `GET /api/v1/leads`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `source` (string) - Filter by source
- `converted` (boolean) - Filter by conversion status
- `startDate` (ISO 8601) - Filter from date
- `endDate` (ISO 8601) - Filter to date
- `search` (string) - Search by name or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "f3e4741d-98db-484c-bf15-68f03b0ea6cc",
      "first_name": "John",
      "email": "john@example.com",
      "phone": "+11234567890",
      "source": "website",
      "utm_data": {
        "utm_source": "google",
        "utm_medium": "cpc",
        "utm_campaign": "mortgage_rates",
        "utm_content": null,
        "utm_term": null
      },
      "referrer_url": null,
      "converted_to_application": false,
      "application": null,
      "created_at": "2026-01-27T19:43:21.826Z",
      "updated_at": "2026-01-27T19:43:21.826Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Example:**
```bash
# Get first page
GET /api/v1/leads?page=1&limit=20

# Filter by source
GET /api/v1/leads?source=website

# Filter by date range
GET /api/v1/leads?startDate=2026-01-01&endDate=2026-01-31

# Search
GET /api/v1/leads?search=john
```

---

#### 3. Get Lead by ID
Retrieve a specific lead by UUID.

**Endpoint:** `GET /api/v1/leads/:id`

**Path Parameters:**
- `id` (UUID) - Lead ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "f3e4741d-98db-484c-bf15-68f03b0ea6cc",
    "first_name": "John",
    "email": "john@example.com",
    "phone": "+11234567890",
    "source": "website",
    "utm_data": { ... },
    "converted_to_application": false,
    "application": null,
    "created_at": "2026-01-27T19:43:21.826Z",
    "updated_at": "2026-01-27T19:43:21.826Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "type": "NOT_FOUND_ERROR",
    "message": "Lead with identifier 'invalid-id' not found"
  }
}
```

---

#### 4. Get Lead by Email
Retrieve the most recent lead by email address.

**Endpoint:** `GET /api/v1/leads/email/:email`

**Path Parameters:**
- `email` (string) - Email address

**Response:** `200 OK` or `404 Not Found`

---

#### 5. Get Lead Statistics
Get aggregated statistics for leads.

**Endpoint:** `GET /api/v1/leads/statistics`

**Query Parameters:**
- `startDate` (ISO 8601) - Filter from date
- `endDate` (ISO 8601) - Filter to date

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "converted_leads": 45,
    "conversion_rate": 30.0,
    "sources": {
      "website": 80,
      "landing_page": 30,
      "social_media": 20,
      "referral": 10,
      "advertisement": 5,
      "organic_search": 3,
      "paid_search": 2,
      "email_campaign": 0,
      "other": 0
    }
  }
}
```

---

#### 6. Get Leads by Source
Get leads grouped by source with conversion rates.

**Endpoint:** `GET /api/v1/leads/by-source`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "source": "website",
      "total_leads": 80,
      "converted_leads": 25,
      "conversion_rate": 31.25
    },
    {
      "source": "landing_page",
      "total_leads": 30,
      "converted_leads": 12,
      "conversion_rate": 40.0
    }
  ]
}
```

---

#### 7. Get Lead Conversion Funnel
Get conversion funnel data.

**Endpoint:** `GET /api/v1/leads/funnel`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "converted_leads": 45,
    "conversion_rate": 30.0,
    "sources": [...],
    "funnel_stages": [
      {
        "stage": "Lead Captured",
        "count": 150,
        "percentage": 100
      },
      {
        "stage": "Converted to Application",
        "count": 45,
        "percentage": 30.0
      }
    ]
  }
}
```

---

#### 8. Mark Lead as Converted
Mark a lead as converted to application.

**Endpoint:** `PATCH /api/v1/leads/:id/convert`

**Path Parameters:**
- `id` (UUID) - Lead ID

**Request Body:**
```json
{
  "applicationId": "uuid-of-application"
}
```

**Response:** `200 OK`

---

#### 9. Delete Lead
Delete a lead (only if not converted).

**Endpoint:** `DELETE /api/v1/leads/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

#### 10. Bulk Create Leads
Create multiple leads at once (max 100).

**Endpoint:** `POST /api/v1/leads/bulk`

**Request Body:**
```json
{
  "leads": [
    {
      "first_name": "John",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    {
      "first_name": "Jane",
      "email": "jane@example.com",
      "phone": "0987654321"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "2 leads created successfully",
  "data": {
    "created": [...],
    "errors": [],
    "summary": {
      "total": 2,
      "created": 2,
      "failed": 0
    }
  }
}
```

---

## Applications API

### Overview
Manage mortgage applications with full CRUD operations and progress tracking.

### Endpoints

#### 1. Create Application
Create a new mortgage application.

**Endpoint:** `POST /api/v1/applications`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "loan_amount": 300000,
  "property_value": 400000,
  "loan_type": "conventional",
  "property_type": "single_family",
  "credit_score_range": "Good (670-739)",
  "employment_type": "full_time",
  "annual_income": 80000,
  "down_payment": 60000,
  "property_address": "123 Main St",
  "property_city": "New York",
  "property_state": "NY",
  "property_zip": "10001"
}
```

**Required Fields:**
- `first_name` (string, 1-100 chars)
- `last_name` (string, 1-100 chars)
- `email` (string, valid email)
- `phone` (string, valid phone)

**Optional Fields:**
- `loan_amount` (number, 50000-10000000)
- `property_value` (number, 50000-20000000)
- `loan_type` (enum: conventional, fha, va, usda, jumbo, heloc, home_equity, refinance)
- `property_type` (enum: single_family, condo, townhouse, multi_family, manufactured, land, commercial)
- `credit_score_range` (string)
- `employment_type` (enum: full_time, part_time, self_employed, contract, retired, unemployed, student, other)
- `annual_income` (number, 0-10000000)
- `down_payment` (number, 0-5000000)
- `property_address` (string)
- `property_city` (string)
- `property_state` (string)
- `property_zip` (string)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "uuid",
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+11234567890"
    },
    "loan_info": {
      "loan_amount": 300000,
      "loan_type": "conventional",
      "down_payment": 60000
    },
    "property_info": {
      "property_value": 400000,
      "property_type": "single_family",
      "property_address": "123 Main St",
      "property_city": "New York",
      "property_state": "NY",
      "property_zip": "10001"
    },
    "financial_info": {
      "credit_score_range": "Good (670-739)",
      "employment_type": "full_time",
      "annual_income": 80000
    },
    "status": "draft",
    "current_step": "personal_info",
    "is_abandoned": false,
    "completed_steps": 0,
    "ltv_ratio": 75.0,
    "created_at": "2026-01-27T19:43:21.826Z",
    "updated_at": "2026-01-27T19:43:21.826Z"
  }
}
```

**Business Rules:**
- Email must be unique (one active application per email)
- LTV (Loan-to-Value) ratio calculated automatically
- Status starts as 'draft'
- Automatically links with existing lead if email matches

---

#### 2. Get All Applications
Retrieve all applications with filtering and pagination.

**Endpoint:** `GET /api/v1/applications`

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `status` (enum: draft, in_progress, submitted, under_review, approved, rejected, cancelled)
- `loan_type` (string)
- `abandoned` (boolean)
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `search` (string) - Search by name or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "personal_info": { ... },
      "loan_info": { ... },
      "property_info": { ... },
      "financial_info": { ... },
      "status": "in_progress",
      "current_step": "property_info",
      "completed_steps": 2,
      "ltv_ratio": 75.0,
      "rate_offers_count": 3,
      "latest_rate_offer": "2026-01-27T19:43:21.826Z",
      "created_at": "2026-01-27T19:43:21.826Z",
      "updated_at": "2026-01-27T19:43:21.826Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### 3. Get Application by ID
Retrieve a specific application.

**Endpoint:** `GET /api/v1/applications/:id`

**Response:** `200 OK` (same structure as create response)

---

#### 4. Update Application
Update application details (autosave functionality).

**Endpoint:** `PATCH /api/v1/applications/:id`

**Request Body:** (all fields optional)
```json
{
  "loan_amount": 350000,
  "property_value": 450000,
  "current_step": "property_info",
  "credit_score_range": "Very Good (740-799)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": { ... }
}
```

**Business Rules:**
- Cannot update submitted applications
- Cannot update approved/rejected applications
- Status automatically changes from 'draft' to 'in_progress' when significant data is added
- All updates are logged with timestamps

---

#### 5. Submit Application
Submit application for review.

**Endpoint:** `POST /api/v1/applications/:id/submit`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { ... }
}
```

**Business Rules:**
- Application must be in 'in_progress' status
- All required fields must be completed:
  - loan_amount
  - property_value
  - loan_type
  - property_type
  - credit_score_range
  - employment_type
  - annual_income
  - down_payment
- LTV ratio must be ≤ 100%
- Sets submitted_at timestamp
- Changes status to 'submitted'

---

#### 6. Mark Application as Abandoned
Mark an application as abandoned (for recovery campaigns).

**Endpoint:** `PATCH /api/v1/applications/:id/abandon`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Application marked as abandoned",
  "data": { ... }
}
```

**Business Rules:**
- Cannot abandon submitted or approved applications
- Sets is_abandoned flag and abandoned_at timestamp
- Used for automated abandoned cart recovery

---

#### 7. Get Application Statistics
Get aggregated statistics for applications.

**Endpoint:** `GET /api/v1/applications/statistics`

**Query Parameters:**
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_applications": 250,
    "by_status": {
      "draft": 50,
      "in_progress": 100,
      "submitted": 60,
      "under_review": 20,
      "approved": 15,
      "rejected": 3,
      "cancelled": 2
    },
    "abandoned_applications": 30,
    "averages": {
      "loan_amount": 325000,
      "property_value": 425000
    },
    "by_loan_type": {
      "conventional": 150,
      "fha": 50,
      "va": 30,
      "usda": 10,
      "jumbo": 10
    }
  }
}
```

---

#### 8. Delete Application
Delete an application (only draft or in_progress).

**Endpoint:** `DELETE /api/v1/applications/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

**Business Rules:**
- Cannot delete submitted or under_review applications
- Cascades to related records (progress, OTP, rate offers)

---

### Application Status Flow

```
draft → in_progress → submitted → under_review → approved/rejected
                                                ↓
                                            cancelled
```

### Application Steps

1. **personal_info** - Name, email, phone
2. **property_info** - Property details, address
3. **financial_info** - Income, credit score
4. **employment_info** - Employment details
5. **additional_info** - Additional information
6. **documents** - Document uploads
7. **review** - Review all information
8. **submission** - Final submission

---
