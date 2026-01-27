-- =============================================
-- RatesLookup Database Schema
-- PostgreSQL with UUID Primary Keys
-- Total Tables: 19
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- A. MORTGAGE APPLICATIONS SECTION
-- =============================================

-- 1. Mortgage Applications Table
CREATE TABLE mortgage_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled')),
    loan_amount DECIMAL(12,2),
    property_value DECIMAL(12,2),
    property_type VARCHAR(50) CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'manufactured', 'land', 'commercial')),
    loan_type VARCHAR(50) CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo', 'heloc', 'home_equity', 'refinance')),
    credit_score_range VARCHAR(50),
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'self_employed', 'contract', 'retired', 'unemployed', 'student', 'other')),
    annual_income DECIMAL(12,2),
    down_payment DECIMAL(12,2),
    property_address TEXT,
    property_city VARCHAR(100),
    property_state VARCHAR(50),
    property_zip VARCHAR(10),
    current_step VARCHAR(50) DEFAULT 'personal_info' CHECK (current_step IN ('personal_info', 'property_info', 'financial_info', 'employment_info', 'additional_info', 'documents', 'review', 'submission')),
    is_abandoned BOOLEAN DEFAULT FALSE,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Application Progress Table
CREATE TABLE application_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES mortgage_applications(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL CHECK (step IN ('personal_info', 'property_info', 'financial_info', 'employment_info', 'additional_info', 'documents', 'review', 'submission')),
    is_completed BOOLEAN DEFAULT FALSE,
    payload JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, step)
);

-- 3. OTP Verifications Table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES mortgage_applications(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Rate Offers Table
CREATE TABLE rate_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES mortgage_applications(id) ON DELETE CASCADE,
    interest_rate DECIMAL(5,3) NOT NULL,
    apr DECIMAL(5,3) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    loan_term INTEGER NOT NULL,
    points DECIMAL(3,2) DEFAULT 0,
    closing_costs DECIMAL(10,2),
    lender_name VARCHAR(255),
    loan_program VARCHAR(255),
    rate_lock_period INTEGER DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'accepted', 'declined')),
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Callback Requests Table
CREATE TABLE callback_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES mortgage_applications(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    preferred_time VARCHAR(50),
    preferred_date DATE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    agent_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- B. LEADS SECTION
-- =============================================

-- 6. Lead Captures Table
CREATE TABLE lead_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'landing_page', 'social_media', 'referral', 'advertisement', 'organic_search', 'paid_search', 'email_campaign', 'other')),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    referrer_url TEXT,
    ip_address INET,
    user_agent TEXT,
    converted_to_application BOOLEAN DEFAULT FALSE,
    application_id UUID REFERENCES mortgage_applications(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- C. EXPLORE RATES SECTION
-- =============================================

-- 7. Rate Explorations Table
CREATE TABLE rate_explorations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    loan_amount DECIMAL(12,2) NOT NULL,
    property_value DECIMAL(12,2) NOT NULL,
    credit_score_range VARCHAR(50) NOT NULL,
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo', 'heloc', 'home_equity', 'refinance')),
    property_type VARCHAR(50) CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'manufactured', 'land', 'commercial')),
    zip_code VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    completed_at TIMESTAMP WITH TIME ZONE,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Rate Exploration Results Table
CREATE TABLE rate_exploration_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exploration_id UUID NOT NULL REFERENCES rate_explorations(id) ON DELETE CASCADE,
    lender_name VARCHAR(255) NOT NULL,
    loan_program VARCHAR(255) NOT NULL,
    interest_rate DECIMAL(5,3) NOT NULL,
    apr DECIMAL(5,3) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    loan_term INTEGER NOT NULL,
    points DECIMAL(3,2) DEFAULT 0,
    closing_costs DECIMAL(10,2),
    rate_lock_period INTEGER DEFAULT 30,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Rate Rules Table
CREATE TABLE rate_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    loan_type VARCHAR(50) CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo', 'heloc', 'home_equity', 'refinance')),
    property_type VARCHAR(50) CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'manufactured', 'land', 'commercial')),
    credit_score_min INTEGER,
    credit_score_max INTEGER,
    ltv_min DECIMAL(5,2),
    ltv_max DECIMAL(5,2),
    loan_amount_min DECIMAL(12,2),
    loan_amount_max DECIMAL(12,2),
    rate_adjustment DECIMAL(5,3) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- D. DYNAMIC TOOLS SECTION
-- =============================================

-- 10. Tools Table
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tool Fields Table
CREATE TABLE tool_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'phone', 'select', 'multiselect', 'checkbox', 'radio', 'date', 'currency', 'percentage', 'textarea')),
    is_required BOOLEAN DEFAULT FALSE,
    placeholder VARCHAR(255),
    help_text TEXT,
    validation_rules JSONB,
    options JSONB, -- For select, multiselect, radio fields
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tool_id, field_name)
);

-- 12. Tool Runs Table
CREATE TABLE tool_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    user_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tool Run Values Table
CREATE TABLE tool_run_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES tool_runs(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES tool_fields(id) ON DELETE CASCADE,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(run_id, field_id)
);

-- 14. Tool Results Table
CREATE TABLE tool_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES tool_runs(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    result_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- E. ANALYTICS SECTION
-- =============================================

-- 15. Mortgage Rate History Table
CREATE TABLE mortgage_rate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo', 'heloc', 'home_equity', 'refinance')),
    loan_term INTEGER NOT NULL,
    average_rate DECIMAL(5,3) NOT NULL,
    lowest_rate DECIMAL(5,3) NOT NULL,
    highest_rate DECIMAL(5,3) NOT NULL,
    rate_change DECIMAL(5,3),
    data_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, loan_type, loan_term)
);

-- =============================================
-- F. FAQS SECTION
-- =============================================

-- 16. FAQ Categories Table
CREATE TABLE faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. FAQs Table
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- G. TESTIMONIALS SECTION
-- =============================================

-- 18. Testimonials Table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_title VARCHAR(255),
    customer_location VARCHAR(255),
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    loan_type VARCHAR(50) CHECK (loan_type IN ('conventional', 'fha', 'va', 'usda', 'jumbo', 'heloc', 'home_equity', 'refinance')),
    loan_amount DECIMAL(12,2),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- H. MYTH VS FACT SECTION
-- =============================================

-- 19. Myth vs Fact Items Table
CREATE TABLE myth_fact_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    myth_text TEXT NOT NULL,
    fact_text TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Mortgage Applications Indexes
CREATE INDEX idx_mortgage_applications_email ON mortgage_applications(email);
CREATE INDEX idx_mortgage_applications_phone ON mortgage_applications(phone);
CREATE INDEX idx_mortgage_applications_status ON mortgage_applications(status);
CREATE INDEX idx_mortgage_applications_created_at ON mortgage_applications(created_at);
CREATE INDEX idx_mortgage_applications_abandoned ON mortgage_applications(is_abandoned, abandoned_at);

-- Application Progress Indexes
CREATE INDEX idx_application_progress_application_id ON application_progress(application_id);
CREATE INDEX idx_application_progress_step ON application_progress(step);

-- OTP Verifications Indexes
CREATE INDEX idx_otp_verifications_phone ON otp_verifications(phone);
CREATE INDEX idx_otp_verifications_status ON otp_verifications(status);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Rate Offers Indexes
CREATE INDEX idx_rate_offers_application_id ON rate_offers(application_id);
CREATE INDEX idx_rate_offers_status ON rate_offers(status);
CREATE INDEX idx_rate_offers_expires_at ON rate_offers(expires_at);

-- Callback Requests Indexes
CREATE INDEX idx_callback_requests_email ON callback_requests(email);
CREATE INDEX idx_callback_requests_phone ON callback_requests(phone);
CREATE INDEX idx_callback_requests_status ON callback_requests(status);

-- Lead Captures Indexes
CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_source ON lead_captures(source);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at);
CREATE INDEX idx_lead_captures_converted ON lead_captures(converted_to_application);

-- Rate Explorations Indexes
CREATE INDEX idx_rate_explorations_session_id ON rate_explorations(session_id);
CREATE INDEX idx_rate_explorations_status ON rate_explorations(status);
CREATE INDEX idx_rate_explorations_created_at ON rate_explorations(created_at);

-- Rate Exploration Results Indexes
CREATE INDEX idx_rate_exploration_results_exploration_id ON rate_exploration_results(exploration_id);
CREATE INDEX idx_rate_exploration_results_featured ON rate_exploration_results(is_featured);

-- Rate Rules Indexes
CREATE INDEX idx_rate_rules_active ON rate_rules(is_active);
CREATE INDEX idx_rate_rules_loan_type ON rate_rules(loan_type);
CREATE INDEX idx_rate_rules_priority ON rate_rules(priority);

-- Tools Indexes
CREATE INDEX idx_tools_active ON tools(is_active);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_display_order ON tools(display_order);

-- Tool Fields Indexes
CREATE INDEX idx_tool_fields_tool_id ON tool_fields(tool_id);

-- Tool Runs Indexes
CREATE INDEX idx_tool_runs_tool_id ON tool_runs(tool_id);
CREATE INDEX idx_tool_runs_session_id ON tool_runs(session_id);
CREATE INDEX idx_tool_runs_status ON tool_runs(status);

-- Tool Run Values Indexes
CREATE INDEX idx_tool_run_values_run_id ON tool_run_values(run_id);
CREATE INDEX idx_tool_run_values_field_id ON tool_run_values(field_id);

-- Tool Results Indexes
CREATE INDEX idx_tool_results_run_id ON tool_results(run_id);

-- Mortgage Rate History Indexes
CREATE INDEX idx_mortgage_rate_history_date ON mortgage_rate_history(date);
CREATE INDEX idx_mortgage_rate_history_loan_type ON mortgage_rate_history(loan_type);

-- FAQ Categories Indexes
CREATE INDEX idx_faq_categories_active ON faq_categories(is_active);
CREATE INDEX idx_faq_categories_display_order ON faq_categories(display_order);

-- FAQs Indexes
CREATE INDEX idx_faqs_category_id ON faqs(category_id);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_faqs_display_order ON faqs(display_order);

-- Testimonials Indexes
CREATE INDEX idx_testimonials_active ON testimonials(is_active);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_loan_type ON testimonials(loan_type);
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);

-- Myth Fact Items Indexes
CREATE INDEX idx_myth_fact_items_active ON myth_fact_items(is_active);
CREATE INDEX idx_myth_fact_items_category ON myth_fact_items(category);
CREATE INDEX idx_myth_fact_items_display_order ON myth_fact_items(display_order);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_mortgage_applications_updated_at BEFORE UPDATE ON mortgage_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_progress_updated_at BEFORE UPDATE ON application_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_otp_verifications_updated_at BEFORE UPDATE ON otp_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_offers_updated_at BEFORE UPDATE ON rate_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_callback_requests_updated_at BEFORE UPDATE ON callback_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_captures_updated_at BEFORE UPDATE ON lead_captures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_explorations_updated_at BEFORE UPDATE ON rate_explorations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_rules_updated_at BEFORE UPDATE ON rate_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_fields_updated_at BEFORE UPDATE ON tool_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_runs_updated_at BEFORE UPDATE ON tool_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_categories_updated_at BEFORE UPDATE ON faq_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_myth_fact_items_updated_at BEFORE UPDATE ON myth_fact_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SETUP COMPLETE
-- =============================================

-- Insert default FAQ categories
INSERT INTO faq_categories (name, description, display_order) VALUES
('General', 'General mortgage questions', 1),
('Rates', 'Questions about mortgage rates', 2),
('Application Process', 'Questions about the application process', 3),
('Loan Types', 'Questions about different loan types', 4),
('Requirements', 'Questions about loan requirements', 5);

-- Insert sample rate rules
INSERT INTO rate_rules (rule_name, description, loan_type, credit_score_min, credit_score_max, rate_adjustment, priority) VALUES
('Excellent Credit Discount', 'Discount for excellent credit scores', 'conventional', 800, 850, -0.25, 1),
('Very Good Credit Discount', 'Discount for very good credit scores', 'conventional', 740, 799, -0.125, 2),
('Fair Credit Penalty', 'Penalty for fair credit scores', 'conventional', 580, 669, 0.25, 3),
('Poor Credit Penalty', 'Penalty for poor credit scores', 'conventional', 300, 579, 0.75, 4),
('FHA Loan Adjustment', 'Standard FHA loan rate adjustment', 'fha', 580, 850, 0.125, 5),
('VA Loan Discount', 'Discount for VA loans', 'va', 620, 850, -0.125, 6),
('Jumbo Loan Premium', 'Premium for jumbo loans', 'jumbo', 700, 850, 0.25, 7);

COMMENT ON DATABASE rateslookup IS 'RatesLookup - Complete mortgage rate lookup and application system';