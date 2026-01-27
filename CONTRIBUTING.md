# Contributing to RatesLookup Backend

First off, thank you for considering contributing to RatesLookup Backend! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed**
* **Explain which behavior you expected to see instead**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript/Node.js styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch from `main`
3. Make your changes
4. Write or adapt tests as needed
5. Ensure the test suite passes
6. Make sure your code lints
7. Issue a pull request

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/rateslookup-backend.git

# Install dependencies
npm install

# Setup database
createdb -U postgres rateslookup_dev
psql -U postgres -d rateslookup_dev -f src/database/index.sql

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### Coding Standards

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes for strings
* Add comments for complex logic
* Follow existing code style
* Write meaningful commit messages

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Testing

```bash
# Run tests
npm test

# Run setup verification
npm run test:setup
```

## Project Structure

```
src/
├── modules/          # Feature modules
│   └── [module]/
│       ├── repository.js  # Database operations
│       ├── service.js     # Business logic
│       ├── controller.js  # HTTP handlers
│       ├── routes.js      # API routes
│       └── validation.js  # Input validation
├── middlewares/      # Express middleware
├── utils/            # Utility functions
└── config/           # Configuration
```

## Module Development

When creating a new module, follow this structure:

1. **Repository** - Raw SQL queries only
2. **Service** - Business logic
3. **Controller** - Request/response handling
4. **Routes** - RESTful endpoints
5. **Validation** - Input validation rules

## Questions?

Feel free to open an issue with your question or contact the maintainers.

Thank you for contributing! 🙏