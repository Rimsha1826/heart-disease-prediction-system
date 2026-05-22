# Contributing to Heart Disease Prediction System

Thank you for your interest in contributing to the Heart Disease Prediction System! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Report Bugs](#report-bugs)
- [Suggest Features](#suggest-features)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity, experience level, nationality, personal appearance, religion, sexual identity, or sexual orientation.

### Expected Behavior

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be professional in all interactions
- Focus on constructive feedback
- Respect differing opinions and approaches

### Unacceptable Behavior

- Harassment or discrimination
- Offensive comments or slurs
- Personal attacks
- Trolling or inflammatory behavior
- Any form of abuse

**Violations** will be reviewed and addressed appropriately.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git
- GitHub account
- Familiarity with the project structure

### Initial Steps

1. **Fork the Repository**
   ```bash
   # Navigate to the project on GitHub
   # Click "Fork" button in the top-right corner
   # This creates a copy under your account
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/heart-disease-prediction.git
   cd heart-disease-prediction
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/heart-disease-prediction.git
   git remote -v  # Verify both remotes exist
   ```

4. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

---

## 💻 Development Setup

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run the server
python app.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
```

---

## ✏️ Making Changes

### Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes:
git checkout -b bugfix/issue-description

# Or for documentation:
git checkout -b docs/update-description
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/refactor-description` - Code refactoring
- `test/test-description` - Adding tests

### Commit to Your Branch

```bash
# Make your changes
# Stage changes
git add .

# Or stage specific files
git add path/to/file

# Commit with descriptive message
git commit -m "Add feature: description"

# Push to your fork
git push origin feature/your-feature-name
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that doesn't add features or fix bugs
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, etc.

### Example Commits

```bash
git commit -m "feat: Add image preprocessing module"
git commit -m "fix: Correct model inference timeout issue"
git commit -m "docs: Update API documentation"
git commit -m "refactor: Improve image validation logic"
git commit -m "test: Add test cases for prediction endpoint"
```

---

## 🔄 Pull Request Process

### Before Creating a PR

1. **Update Your Branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   # Resolve any conflicts if they exist
   ```

2. **Run Tests**
   ```bash
   pytest backend/tests/
   npm test  # in frontend directory
   ```

3. **Check Code Quality**
   - Run linter: `pylint backend/`
   - Format code: `black backend/`
   - Check for unused imports

### Creating a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to the original repository
   - Click "Pull requests" tab
   - Click "New Pull Request" button
   - Select your branch as the source

3. **Fill PR Template**
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Link to related issues: "Closes #123"
   - Screenshots if UI changes
   - Checklist of completed tasks

### PR Title Format

```
[Type]: Description

Examples:
[Feature]: Add patient history tracking
[Fix]: Resolve model loading timeout
[Docs]: Update installation guide
[Refactor]: Optimize image preprocessing
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] Tested on Web
- [ ] Unit tests added
- [ ] Integration tests added

## Screenshots (if applicable)
Include screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings introduced
```

### Review Process

- Maintainers will review your PR
- Provide feedback or request changes if needed
- Address all comments and re-request review
- PR will be merged once approved

---

## 🎨 Coding Standards

### Python (Backend)

**Style Guide**: PEP 8

```python
# Good
def validate_ecg_image(file_path: str) -> bool:
    """
    Validate if the uploaded file is a valid ECG image.
    
    Args:
        file_path (str): Path to the image file
        
    Returns:
        bool: True if valid, False otherwise
    """
    allowed_extensions = {'.jpg', '.jpeg', '.png'}
    return Path(file_path).suffix.lower() in allowed_extensions

# Bad
def validateECGimage(filePath):
    allowed = ['.jpg', '.jpeg', '.png']
    return filePath.split('.')[-1] in allowed
```

**Naming Conventions**:
- Functions/variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_prefix_with_underscore`

### JavaScript (Frontend)

**Style Guide**: Airbnb JavaScript Style Guide

```javascript
// Good
const validateECGImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  return allowedTypes.includes(file.type);
};

// Bad
function validate_image(f) {
  return ['image/jpeg', 'image/png'].includes(f.type);
}
```

**Naming Conventions**:
- Functions/variables: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_prefix_with_underscore`

### General Guidelines

- Keep functions small and focused (max 20 lines)
- Use meaningful variable names
- Add comments for complex logic
- Avoid magic numbers - use named constants
- Handle errors gracefully
- Use type hints (Python) and PropTypes (React)

---

## 🧪 Testing

### Backend Testing

```bash
# Install testing dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_prediction.py
```

### Example Test

```python
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_predict_with_no_image(client):
    response = client.post('/predict')
    assert response.status_code == 400
    assert 'error' in response.json
```

### Frontend Testing

```bash
# Install testing dependencies
npm install --save-dev jest react-test-library

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 📚 Documentation

### Code Documentation

**Python Docstrings**:
```python
def predict_disease(image_path: str) -> dict:
    """
    Predict disease from ECG image using trained CNN model.
    
    Args:
        image_path (str): Path to the ECG image file
        
    Returns:
        dict: Prediction results with keys:
            - prediction (str): Disease class
            - confidence (float): Confidence score
            - risk_level (str): Risk assessment
            
    Raises:
        FileNotFoundError: If image file not found
        ValueError: If image is invalid
    """
```

**JavaScript JSDoc**:
```javascript
/**
 * Validates ECG image format and size
 * @param {File} file - The image file to validate
 * @returns {Promise<{valid: boolean, error: string|null}>} Validation result
 */
const validateImage = async (file) => {
  // implementation
};
```

### README Updates

When making changes that affect:
- Installation process
- API endpoints
- Configuration
- Project structure

Update the relevant sections in the README.md

---

## 🐛 Report Bugs

### Bug Report Format

When opening an issue for a bug:

1. **Use a clear title**: "Bug: Image validation fails for PNG files"
2. **Describe the bug**: What is happening vs. what should happen
3. **Steps to reproduce**:
   ```
   1. Upload a PNG image
   2. Select image from gallery
   3. Observe error message
   ```
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots/logs**: Attach relevant files
7. **Environment**: OS, Python version, Device, etc.

### Example Bug Report

```markdown
## Bug: Model fails to load on Android 8.0

### Description
The application crashes when trying to load the Keras model on Android 8.0 devices.

### Steps to Reproduce
1. Install app on Android 8.0 device
2. Launch application
3. Select an ECG image
4. App crashes

### Expected Behavior
Model loads successfully and prediction is made

### Actual Behavior
RuntimeError: Model loading failed

### Environment
- Device: Samsung Galaxy A8 (2018)
- Android: 8.0
- App Version: 1.0.0
- Python: 3.8

### Logs
[Attach crash logs]
```

---

## 💡 Suggest Features

### Feature Request Format

When suggesting new features:

1. **Use a clear title**: "Feature: Add patient history tracking"
2. **Describe the feature**: What should it do?
3. **Use case**: Why is this needed?
4. **Proposed implementation**: How could it work?
5. **Alternatives**: Other solutions considered

### Example Feature Request

```markdown
## Feature: Add patient history tracking

### Description
Allow users to view their previous predictions and track disease risk over time.

### Use Case
Patients want to monitor their ECG predictions over weeks/months to track health changes.

### Proposed Implementation
- Store predictions in local database
- Add history screen to view past predictions
- Show trend graphs for confidence scores

### Alternatives Considered
- Cloud-based storage (privacy concerns)
- Manual CSV export (less user-friendly)
```

---

## 🙏 Thank You!

Thank you for contributing to this project! Your efforts help make cardiac health prediction more accessible. If you have questions, please don't hesitate to ask in our discussions or reach out to the maintainers.

---

## 📞 Contact & Support

- **Issues**: Use GitHub Issues for bugs and features
- **Discussions**: Join GitHub Discussions for questions
- **Email**: your.email@example.com
- **Documentation**: Check `docs/` folder for detailed guides

---

## 📖 Additional Resources

- [How to Contribute to Open Source](https://github.com/freeCodeCamp/how-to-contribute-to-open-source)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [PEP 8 Style Guide](https://pep8.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

**Happy Contributing! 🎉**
