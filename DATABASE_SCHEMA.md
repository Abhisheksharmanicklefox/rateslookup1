# Database Schema Documentation

## Overview
The RatesLookup database consists of 19 tables organized into 8 functional groups.

**Database:** PostgreSQL 16+  
**Primary Keys:** UUID (uuid-ossp extension)  
**Timestamps:** Automatic via triggers  
**Relationships:** Foreign keys with CASCADE delete

---

## Table of Contents
1. [Mortgage Applications](#mortgage-applications)
2. [Leads](#leads)
3. [Explore Rates](#explore-rates)
4. [Dynamic Tools](#dynamic-tools)
5. [Analytics](#analytics)
6. [FAQs](#faqs)
7. [Testimonials](#testimonials)
8. [Myth vs Fact](#myth-vs-fact)
9. [Indexes](#indexes)
10. [Triggers](#triggers)

---

## Mortgage Applications

### 1. mortgage_applications
Main table for mortgage applications.

**Columns:**
```sql
id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4()
first_name          VARCHAR(100) NOT NULL
last_name           VARCHAR(100) NOT NULL
email               VARCHAR(255) NOT NULL
phone               VARCHAR(20) NOT NULL
status              VARCHAR(50) NOT NULL DEFAULT 'draft'
loan_amount         DECIMAL(12,2)
property_value      DECIMAL(12,2)
property_type       VARCHAR(50)
loan_type           VARCHAR(50)
credit_score_range  VARCHAR(50)
employment_type     VARCHAR(50)
annual_income       DECIMAL(12,2)
down_payment        DECIMAL(12,2)
property_address    TEXT
property_city       VARCHAR(100)
property_state      VARCHAR(50)
property_zip        VARCHAR(10)
current_step        VARCHAR(50) DEFAULT 'personal_info'
is_abandoned        BOOLEAN DEFAULT FALSE
abandoned_at        TIMESTAMP WITH TIME ZONE
submitted_at        TIMESTAMP WITH TIME ZONE
created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Status Values:**
- `draft` - Initial state
- `in_progress` - User is filling out application
- `submitted` - Application submitted for review
- `under_review` - Being reviewed by team
- `approved` - Application approved
- `rejected` - Application rejected
- `cancelled` - Application cancelled

**Loan Types:**
- `conventional` - Conventional loan
- `fha` - FHA loan
- `va` - VA loan
- `usda` - USDA loan
- `jumbo` - Jumbo loan
- `heloc` - Home Equity Line of Credit
- `home_equity` - Home Equity Loan
- `refinance` - Refinance

**Property Types:**
- `single_family` - Single family home
- `condo` - Condominium
- `townhouse` - Townhouse
- `multi_family` - Multi-family property
- `manufactured` - Manufactured home
- `land` - Land
- `commercial` - Commercial property

**Employment Types:**
- `full_time` - Full-time employment
- `part_time` - Part-time employment
- `self_employed` - Self-employed
- `contract` - Contract worker
- `retired` - Retired
- `unemployed` - Unemployed
- `student` - Student
- `other` - Other

**Progress Steps:**
- `personal_info` - Personal information
- `property_info` - Property details
- `financial_info` - Financial information
- `employment_info` - Employment details
- `additional_info` - Additional information
- `documents` - Document uploads
- `review` - Review all information
- `submission` - Final submission

**Indexes:**
- `idx_mortgage_applications_email` ON (email)
- `idx_mortgage_applications_phone` ON (phone)
- `idx_mortgage_applications_status` ON (status)
- `idx_mortgage_applications_created_at` ON (created_at)
- `idx_mortgage_applications_abandoned` ON (is_abandoned, abandoned_at)

---

### 2. application_progress
Tracks step-by-step progress through the application.

**Columns:**
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
application_id  UUID NOT NULL REFERENCES mortgage_applications(id) ON DELETE CASCADE
step            VARCHAR(50) NOT NULL
is_completed    BOOLEAN DEFAULT FALSE
payload         JSONB
completed_at    TIMESTAMP WITH TIME ZONE
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
UNIQUE(application_id, step)
```

**Purpose:**
- Autosave functionality
- Track which steps are completed
- Store step-specific data in JSONB payload
- Enable abandoned cart recovery

**Indexes:**
- `idx_application_progress_application_id` ON (application_id)
- `idx_application_progress_step` ON (step)

---

### 3. otp_verifications
OTP (One-Time Password) verification for phone numbers.

**Columns:**
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
application_id  UUID REFERENCES mortgage_applications(id) ON DELETE CASCADE
phone           VARCHAR(20) NOT NULL
otp_hash        VARCHAR(255) NOT NULL
status          VARCHAR(20) NOT NULL DEFAULT 'pending'
attempts        INTEGER DEFAULT 0
max_attempts    INTEGER DEFAULT 3
expires_at      TIMESTAMP WITH TIME ZONE NOT NULL
verified_at     TIMESTAMP WITH TIME ZONE
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Status Values:**
- `pending` - OTP sent, awaiting verification
- `verified` - OTP successfully verified
- `expired` - OTP expired
- `failed` - Max attempts exceeded

**Security:**
- OTP is hashed using bcrypt before storage
- Expires after configurable time (default: 10 minutes)
- Max attempts limit (default: 3)
- Rate limited at API level

**Indexes:**
- `idx_otp_verifications_phone` ON (phone)
- `idx_otp_verifications_status` ON (status)
- `idx_otp_verifications_expires_at` ON (expires_at)

---

### 4. rate_offers
Rate offers generated for applications.

**Columns:**
```sql
id                UUID PRIMARY KEY DEFAULT uuid_generate_v4()
application_id    UUID NOT NULL REFERENCES mortgage_applications(id) ON DELETE CASCADE
interest_rate     DECIMAL(5,3) NOT NULL
apr               DECIMAL(5,3) NOT NULL
monthly_payment   DECIMAL(10,2) NOT NULL
loan_term         INTEGER NOT NULL
points            DECIMAL(3,2) DEFAULT 0
closing_costs     DECIMAL(10,2)
lender_name       VARCHAR(255)
loan_program      VARCHAR(255)
rate_lock_period  INTEGER DEFAULT 30
status            VARCHAR(20) NOT NULL DEFAULT 'active'
expires_at        TIMESTAMP WITH TIME ZONE
accepted_at       TIMESTAMP WITH TIME ZONE
created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Status Values:**
- `active` - Rate offer is active
- `expired` - Rate offer expired
- `accepted` - Customer accepted offer
- `declined` - Customer declined offer

**Indexes:**
- `idx_rate_offers_application_id` ON (application_id)
- `idx_rate_offers_status` ON (status)
- `idx_rate_offers_expires_at` ON (expires_at)

---

### 5. callback_requests
Customer callback requests.

**Columns:**
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
application_id  UUID REFERENCES mortgage_applications(id) ON DELETE CASCADE
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
email           VARCHAR(255) NOT NULL
phone           VARCHAR(20) NOT NULL
preferred_time  VARCHAR(50)
preferred_date  DATE
message         TEXT
status          VARCHAR(20) NOT NULL DEFAULT 'pending'
scheduled_at    TIMESTAMP WITH TIME ZONE
completed_at    TIMESTAMP WITH TIME ZONE
agent_notes     TEXT
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Status Values:**
- `pending` - Awaiting scheduling
- `scheduled` - Callback scheduled
- `completed` - Callback completed
- `cancelled` - Callback cancelled

**Indexes:**
- `idx_callback_requests_email` ON (email)
- `idx_callback_requests_phone` ON (phone)
- `idx_callback_requests_status` ON (status)

---

## Leads

### 6. lead_captures
Lead capture with UTM tracking.

**Columns:**
```sql
id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4()
first_name                  VARCHAR(100) NOT NULL
email                       VARCHAR(255) NOT NULL
phone                       VARCHAR(20)
source                      VARCHAR(50) DEFAULT 'website'
utm_source                  VARCHAR(255)
utm_medium                  VARCHAR(255)
utm_campaign                VARCHAR(255)
utm_content                 VARCHAR(255)
utm_term                    VARCHAR(255)
referrer_url                TEXT
ip_address                  INET
user_agent                  TEXT
converted_to_application    BOOLEAN DEFAULT FALSE
application_id              UUID REFERENCES mortgage_applications(id) ON DELETE SET NULL
created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Source Values:**
- `website` - Main website
- `landing_page` - Landing page
- `social_media` - Social media
- `referral` - Referral
- `advertisement` - Advertisement
- `organic_search` - Organic search
- `paid_search` - Paid search
- `email_campaign` - Email campaign
- `other` - Other source

**Purpose:**
- Track marketing attribution
- Measure conversion rates by source
- Link leads to applications
- Support marketing analytics

**Indexes:**
- `idx_lead_captures_email` ON (email)
- `idx_lead_captures_source` ON (source)
- `idx_lead_captures_created_at` ON (created_at)
- `idx_lead_captures_converted` ON (converted_to_application)

---

## Explore Rates

### 7. rate_explorations
Rate exploration sessions.

**Columns:**
```sql
id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4()
session_id          VARCHAR(255) NOT NULL
loan_amount         DECIMAL(12,2) NOT NULL
property_value      DECIMAL(12,2) NOT NULL
credit_score_range  VARCHAR(50) NOT NULL
loan_type           VARCHAR(50) NOT NULL
property_type       VARCHAR(50)
zip_code            VARCHAR(10)
status              VARCHAR(20) NOT NULL DEFAULT 'in_progress'
completed_at        TIMESTAMP WITH TIME ZONE
abandoned_at        TIMESTAMP WITH TIME ZONE
created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Status Values:**
- `in_progress` - User exploring rates
- `completed` - Exploration completed
- `abandoned` - User abandoned exploration

**Indexes:**
- `idx_rate_explorations_session_id` ON (session_id)
- `idx_rate_explorations_status` ON (status)
- `idx_rate_explorations_created_at` ON (created_at)

---

### 8. rate_exploration_results
Results from rate explorations.

**Columns:**
```sql
id                UUID PRIMARY KEY DEFAULT uuid_generate_v4()
exploration_id    UUID NOT NULL REFERENCES rate_explorations(id) ON DELETE CASCADE
lender_name       VARCHAR(255) NOT NULL
loan_program      VARCHAR(255) NOT NULL
interest_rate     DECIMAL(5,3) NOT NULL
apr               DECIMAL(5,3) NOT NULL
monthly_payment   DECIMAL(10,2) NOT NULL
loan_term         INTEGER NOT NULL
points            DECIMAL(3,2) DEFAULT 0
closing_costs     DECIMAL(10,2)
rate_lock_period  INTEGER DEFAULT 30
is_featured       BOOLEAN DEFAULT FALSE
display_order     INTEGER DEFAULT 0
created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Indexes:**
- `idx_rate_exploration_results_exploration_id` ON (exploration_id)
- `idx_rate_exploration_results_featured` ON (is_featured)

---

### 9. rate_rules
Rules for rate calculations.

**Columns:**
```sql
id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4()
rule_name           VARCHAR(255) NOT NULL UNIQUE
description         TEXT
loan_type           VARCHAR(50)
property_type       VARCHAR(50)
credit_score_min    INTEGER
credit_score_max    INTEGER
ltv_min             DECIMAL(5,2)
ltv_max             DECIMAL(5,2)
loan_amount_min     DECIMAL(12,2)
loan_amount_max     DECIMAL(12,2)
rate_adjustment     DECIMAL(5,3) NOT NULL DEFAULT 0
is_active           BOOLEAN DEFAULT TRUE
priority            INTEGER DEFAULT 0
created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Purpose:**
- Define rate adjustment rules
- Support dynamic rate calculations
- Admin-configurable pricing

**Indexes:**
- `idx_rate_rules_active` ON (is_active)
- `idx_rate_rules_loan_type` ON (loan_type)
- `idx_rate_rules_priority` ON (priority)

---
