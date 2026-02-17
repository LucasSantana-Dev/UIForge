---
name: 🔒 Security Issue
about: Report a security vulnerability or security concern
title: "[SECURITY] "
labels: ["security", "urgent", "needs-triage"]
assignees: []

---

## 🚨 Security Issue Description
<!-- A clear and concise description of the security issue -->
<!-- DO NOT include sensitive credentials or detailed exploit information -->

## 🔍 Type of Security Issue
<!-- Select all that apply -->
- [ ] Authentication/Authorization vulnerability
- [ ] Data exposure/leakage
- [ ] Injection vulnerability (SQL, XSS, etc.)
- [ ] Cross-Site Scripting (XSS)
- [ ] Cross-Site Request Forgery (CSRF)
- [ ] Insecure direct object references
- [ ] Security misconfiguration
- [ ] Sensitive data exposure
- [ ] Insufficient logging/monitoring
- [ ] Broken authentication
- [ ] Broken access control
- [ ] Server-Side Request Forgery (SSRF)
- [ ] Other (please specify)

## 🎯 Affected Components
<!-- Which parts of the application are affected? -->
- [ ] Frontend (React components, UI)
- [ ] Backend API (Node.js, Express)
- [ ] Database (Supabase/PostgreSQL)
- [ ] Authentication system
- [ ] File upload/download
- [ ] Third-party integrations
- [ ] Configuration/Environment
- [ ] Other (please specify)

## 🌐 Environment Information
<!-- Where was this issue discovered? -->
- [ ] Production environment
- [ ] Staging/Development environment
- [ ] Local development
- [ ] Third-party service
- [ ] Other (please specify)

## 📱 Technical Details
<!-- Technical information about the vulnerability -->
- **Component**: [e.g., API endpoint, React component, Database table]
- **URL/Endpoint**: [e.g., /api/users, /auth/login]
- **Method**: [e.g., POST, GET, PUT, DELETE]
- **Parameters**: [e.g., user_id, email, password]
- **Browser**: [e.g., Chrome 108, Firefox 107]

## 🔄 Reproduction Steps
<!-- Steps to reproduce the security issue -->
<!-- DO NOT include sensitive data or credentials -->
1.
2.
3.
4.

## 💥 Impact Assessment
<!-- What is the potential impact of this vulnerability? -->
- **Data at Risk**: [e.g., User credentials, Personal data, Financial data]
- **Access Level**: [e.g., Read-only, Write access, Admin access]
- **Scope**: [e.g., Single user, All users, System-wide]
- **Exploitability**: [e.g., Easy, Moderate, Difficult]

## 🔧 Mitigation Steps
<!-- Any immediate mitigation steps taken or recommended -->
- [ ] Issue has been contained/isolated
- [ ] Temporary fix implemented
- [ ] Users notified (if applicable)
- [ ] Security monitoring increased

## 📊 Severity Assessment
<!-- Help us understand the severity of this security issue -->
- **Severity**: [Critical/High/Medium/Low]
- **Likelihood**: [Certain/Likely/Possible/Unlikely]
- **Impact**: [Critical/High/Medium/Low]
- **Overall Risk**: [Critical/High/Medium/Low]

## 🔐 Security Best Practices
<!-- Which security best practices were violated? -->
- [ ] Input validation
- [ ] Output encoding
- [ ] Authentication mechanisms
- [ ] Authorization checks
- [ ] Error handling
- [ ] Logging and monitoring
- [ ] Secure configuration
- [ ] Data encryption

## 📋 Remediation Plan
<!-- What needs to be done to fix this issue? -->
- [ ] Immediate action required
- [ ] Code changes needed
- [ ] Configuration updates needed
- [ ] Database changes needed
- [ ] Third-party updates needed
- [ ] Documentation updates needed

## 🚨 Disclosure Policy
<!-- How should this issue be disclosed? -->
- [ ] Private disclosure (recommended)
- [ ] Public disclosure after fix
- [ ] Coordinated disclosure
- [ ] No disclosure (internal only)

## 📸 Evidence
<!-- Any evidence, screenshots, or logs (remove sensitive data) -->
<!-- DO NOT include sensitive credentials or personal data -->

## 🔍 Additional Context
<!-- Any additional context about the security issue -->

## 📞 Contact Information
<!-- Who should be contacted about this issue? -->
- **Security Team**: [security@company.com]
- **Lead Developer**: [dev-lead@company.com]
- **Product Owner**: [product@company.com]

---

## 🔍 Triage Checklist (for maintainers)

- [ ] Issue severity assessed (Critical/High/Medium/Low)
- [ ] Impact scope determined
- [ ] Immediate mitigation steps taken
- [ ] Security team notified
- [ ] Public disclosure policy determined
- [ ] Remediation plan created
- [ ] Assigned to appropriate team member
- [ ] Labels applied correctly
- [ ] Related security issues linked
- [ ] Duplicate security issues checked

## ⚠️ IMPORTANT SECURITY NOTES

- **DO NOT** commit exploit code or detailed vulnerability information
- **DO NOT** include sensitive credentials or personal data
- **DO NOT** discuss publicly until fixed
- **DO** follow responsible disclosure practices
- **DO** document all remediation steps
- **DO** update security policies if needed