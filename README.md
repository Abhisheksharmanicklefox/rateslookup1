# RatesLookup Backend

A complete Node.js backend for a mortgage rate lookup and application system built with Express.js and PostgreSQL.

## 🏗️ Architecture Overview

This backend follows a modular, scalable architecture designed for production use:

- **Tech Stack**: Node.js, Express.js, PostgreSQL, pg (node-postgres)
- **Architecture**: Modular design with separation of concerns
- **Database**: PostgreSQL with UUID primary keys and proper indexing
- **Security**: Rate limiting, input validation, error handling
- **Scalability**: Connection pooling, efficient queries, caching-ready

## 📁 Project Structure

```
project-root/
├── package.json
├── .env
├── src/
│   ├── server.js                 # Server startup and graceful shutdown
│   ├── app.js                    # Express app configuration
│   ├── routes.js                 # Main API routes
│   ├── config/
│   │   ├── env.js               # Environment configuration
│   │   ├── db.js                # Database connection and helpers
│   │   └── constants.js         # Application constants
│   ├── database/
│   │   ├── index.sql            # Complete database schema
│   │   ├── migrations/          # Database migrations (future)
│   │   └── seeds/               # Seed data (future)
│   ├── modules/
│   │   ├── applications/        # Mortgage applications
│   │   ├── progress/            # Application progress tracking
│   │   ├── otp/                 # OTP verification system
│   │   ├── rates/               # Rate offers and calculations
│   │   ├── callbacks/           # Callback requests
│   │   ├── leads/               # Lead capture (COMPLETE)
│   │   ├── explore-rates/       # Rate exploration tools
│   │   ├── tools/               # Dynamic calculation tools
│   │   ├── analytics/           # Analytics and reporting
│   │   ├── faqs/                # FAQ management
│   │   ├── testimonials/        # Customer testimonials
│   │   └── myths/               # Myth vs fact content
│   ├── middlewares/
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── notFoundHandler.js   # 404 handler
│   │   ├── validation.js        # Validation helpers
│   │   └── rateLimiter.js       # Rate limiting configurations
│   └── utils/
│       ├── errors.js            # Custom error classes
│       └── helpers.js           # Utility functions
```

### Module Structure

Each module follows this consistent structure:
```
module-name/
├── repository.js    # Database operations (raw SQL)
├── service.js       # Business logic
├── controller.js    # Request/response handling
├── routes.js        # RESTful endpoints
└── validation.js    # Input validation rules
```

## 🗄️ Database Design

### Total Tables: 19

#### A. Mortgage Applications (5 tables)
1. **mortgage_applications** - Main application data
2. **application_progress** - Step-by-step progress tracking
3. **otp_verifications** - Phone verification system
4. **rate_offers** - Generated rate offers
5. **callback_requests** - Customer callback requests

#### B. Leads (1 table)
6. **lead_captures** - Lead capture with UTM tracking

#### C. Explore Rates (3 tables)
7. **rate_explorations** - Rate exploration sessions
8. **rate_exploration_results** - Exploration results
9. **rate_rules** - Rate calculation rules

#### D. Dynamic Tools (5 tables)
10. **tools** - Available calculation tools
11. **tool_fields** - Tool input fields
12. **tool_runs** - Tool execution instances
13. **tool_run_values** - Tool input values
14. **tool_results** - Tool calculation results

#### E. Analytics (1 table)
15. **mortgage_rate_history** - Historical rate data

#### F. FAQs (2 tables)
16. **faq_categories** - FAQ categories
17. **faqs** - FAQ items

#### G. Testimonials (1 table)
18. **testimonials** - Customer testimonials

#### H. Myth vs Fact (1 table)
19. **myth_fact_items** - Educational content

### Key Database Features

- **UUID Primary Keys** - All tables use UUIDs for better scalability
- **Foreign Key Constraints** - Proper referential integrity
- **Indexes** - Optimized for common queries
- **Triggers** - Automatic timestamp updates
- **JSONB Fields** - For flexible data storage where needed
- **ENUMs** - Type safety for status fields

## 🚀 API Endpoints

### Base URL: `/api/v1`

#### Applications Module (COMPLETE)
- `POST /applications` - Create new application
- `GET /applications` - List applications with filtering
- `GET /applications/:id` - Get application by ID
- `PATCH /applications/:id` - Update application
- `POST /applications/:id/submit` - Submit application
- `PATCH /applications/:id/abandon` - Mark as abandoned
- `DELETE /applications/:id` - Delete application
- `GET /applications/statistics` - Get statistics

#### Leads Module (COMPLETE)
- `POST /leads` - Capture new lead
- `GET /leads` - List leads with filtering
- `GET /leads/:id` - Get lead by ID
- `GET /leads/email/:email` - Get lead by email
- `PATCH /leads/:id/convert` - Mark as converted
- `DELETE /leads/:id` - Delete lead
- `GET /leads/statistics` - Get lead statistics
- `GET /leads/by-source` - Get leads by source
- `GET /leads/funnel` - Get conversion funnel
- `POST /leads/bulk` - Bulk create leads

#### Other Modules (Placeholder Routes)
- `POST /otp/send` - Send OTP
- `POST /otp/verify` - Verify OTP
- `GET /progress/:applicationId` - Get progress
- `POST /progress/:applicationId/:step` - Save progress
- `GET /rates/:applicationId` - Get rate offers
- `POST /rates/calculate` - Calculate rates
- `POST /callbacks` - Request callback
- `POST /explore-rates` - Start rate exploration
- `GET /tools` - List available tools
- `POST /tools/:id/run` - Run calculation tool
- `GET /analytics/dashboard` - Analytics dashboard
- `GET /faqs` - Get FAQs
- `GET /testimonials` - Get testimonials
- `GET /myths` - Get myth vs fact items

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd rateslookup-backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up PostgreSQL database**
```bash
# Create database
createdb rateslookup

# Run schema
npm run db:migrate
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/rateslookup
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rateslookup
DB_USER=username
DB_PASSWORD=password
DB_MAX_CONNECTIONS=20

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_WINDOW_MS=300000
OTP_RATE_LIMIT_MAX_REQUESTS=5

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔧 Key Features

### 1. Autosave & Abandoned Leads
- **Automatic Progress Saving**: Application progress is saved at each step
- **Abandoned Detection**: Applications inactive for 24+ hours are marked as abandoned
- **Lead Recovery**: Abandoned applications can be recovered and continued

### 2. OTP Verification System
- **Phone Verification**: Secure OTP-based phone verification
- **Rate Limited**: Protection against abuse with configurable limits
- **Expiry Management**: OTPs expire after configurable time
- **Attempt Tracking**: Maximum attempts before requiring new OTP

### 3. Admin-Driven Tools & Content
- **Dynamic Tools**: Configurable calculation tools with custom fields
- **Content Management**: FAQs, testimonials, and educational content
- **Rate Rules**: Configurable rate calculation rules
- **Analytics**: Comprehensive reporting and analytics

### 4. Rate Calculation Engine
- **Multiple Loan Types**: Support for conventional, FHA, VA, USDA, jumbo loans
- **Credit Score Adjustments**: Rate adjustments based on credit score ranges
- **LTV Calculations**: Loan-to-value ratio calculations and adjustments
- **Real-time Rates**: Dynamic rate calculations based on current market conditions

### 5. Lead Management System
- **UTM Tracking**: Complete UTM parameter tracking for marketing attribution
- **Source Attribution**: Track lead sources and conversion rates
- **Conversion Funnel**: Track leads through to application conversion
- **Bulk Operations**: Support for bulk lead import/export

## 🛡️ Security Features

- **Rate Limiting**: Multiple rate limiters for different endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Protection**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and output encoding
- **Error Handling**: Secure error messages that don't leak sensitive data
- **CORS Configuration**: Configurable CORS policies
- **Helmet Integration**: Security headers via Helmet.js

## 📊 Performance Features

- **Connection Pooling**: Efficient PostgreSQL connection management
- **Indexed Queries**: Optimized database indexes for common queries
- **Pagination**: Efficient pagination for large datasets
- **Caching Ready**: Structure supports Redis caching integration
- **Compression**: Response compression via compression middleware

## 🔍 Monitoring & Logging

- **Request Logging**: Morgan-based HTTP request logging
- **Error Logging**: Comprehensive error logging with context
- **Health Checks**: Built-in health check endpoints
- **Performance Metrics**: Query timing and performance tracking
- **Graceful Shutdown**: Proper cleanup on application termination

## 🧪 Testing

The application is structured for easy testing:

- **Unit Tests**: Each service and repository can be tested independently
- **Integration Tests**: API endpoints can be tested with test database
- **Validation Tests**: Input validation rules are thoroughly testable
- **Error Handling Tests**: Error scenarios are well-defined and testable

## 📈 Scalability Considerations

- **Modular Architecture**: Easy to scale individual modules
- **Database Optimization**: Proper indexing and query optimization
- **Connection Pooling**: Efficient database connection management
- **Stateless Design**: No server-side session storage
- **Microservice Ready**: Modules can be extracted to separate services

## 🔄 Development Workflow

1. **Module Development**: Each module is self-contained and can be developed independently
2. **Database First**: Schema is defined first, then repositories implement queries
3. **Service Layer**: Business logic is separated from HTTP concerns
4. **Validation**: Input validation is defined declaratively
5. **Error Handling**: Consistent error handling across all modules

## 📝 Implementation Status

### ✅ Completed Modules
- **Core Infrastructure**: Server, database, middleware, utilities
- **Applications Module**: Complete CRUD operations with business logic
- **Leads Module**: Complete lead capture and management system

### 🚧 Placeholder Modules (Ready for Implementation)
- **OTP Module**: Phone verification system
- **Progress Module**: Application progress tracking
- **Rates Module**: Rate calculation and offers
- **Callbacks Module**: Callback request management
- **Explore Rates Module**: Rate exploration tools
- **Tools Module**: Dynamic calculation tools
- **Analytics Module**: Reporting and analytics
- **FAQs Module**: FAQ management
- **Testimonials Module**: Customer testimonials
- **Myths Module**: Educational content

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS termination
6. Configure logging aggregation

### Recommended Infrastructure
- **Load Balancer**: Nginx or AWS ALB
- **Database**: PostgreSQL with read replicas
- **Caching**: Redis for session and data caching
- **Monitoring**: Application performance monitoring
- **Logging**: Centralized logging (ELK stack or similar)

## 📞 Support

This backend provides a solid foundation for a mortgage rate lookup and application system. The modular architecture makes it easy to extend and maintain, while the comprehensive database design supports complex business requirements.

For questions or support, refer to the inline code documentation and the detailed API endpoint implementations.