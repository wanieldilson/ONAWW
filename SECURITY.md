# 🔒 Security Guide

This project includes comprehensive security measures to protect against vulnerabilities, including recent NPM zero-day exploits.

## 🛡️ Security Tools Integrated

### 1. **Snyk Security Scanning**
- **Real-time vulnerability detection** for dependencies
- **Container image scanning** for Docker builds
- **Continuous monitoring** of the dependency tree
- **Automated security alerts** and patch suggestions

### 2. **NPM Audit**
- Built-in NPM vulnerability scanning
- Automatic security fix suggestions
- Configurable severity thresholds

### 3. **Docker Security**
- Multi-stage builds to minimize attack surface
- Security scanning during build process
- Non-root user execution
- Minimal base images (Alpine Linux)

## 🚀 Quick Security Commands

### Run All Security Checks
```bash
# Run comprehensive security audit (both frontend and backend)
npm run security:all

# Run just NPM audit
npm run security:audit

# Run just Snyk tests
npm run security:snyk
```

### Individual Component Scanning
```bash
# Backend only
npm run security:audit:backend
npm run security:snyk:backend

# Frontend only  
npm run security:audit:frontend
npm run security:snyk:frontend
```

### Security Fixes
```bash
# Automatically fix vulnerabilities where possible
npm run security:fix

# Manual audit fix for specific components
cd backend && npm audit fix
cd frontend && npm audit fix
```

## 🔧 Snyk Setup

### Initial Setup
1. **Create Snyk Account**
   - Go to [snyk.io](https://snyk.io)
   - Sign up with GitHub/Google/email

2. **Get API Token**
   - Go to Account Settings → API Token
   - Copy your token

3. **Authenticate Locally**
   ```bash
   npx snyk auth YOUR_API_TOKEN
   ```

### Environment Variables
```bash
# For local development
export SNYK_TOKEN=your_token_here

# For CI/CD (GitHub Secrets)
# Add SNYK_TOKEN as a repository secret
```

### Snyk Commands
```bash
# Test for vulnerabilities
npx snyk test

# Test with severity threshold
npx snyk test --severity-threshold=medium

# Monitor project (continuous scanning)
npx snyk monitor

# Container scanning
npx snyk container test your-image:tag

# Fix vulnerabilities automatically
npx snyk fix
```

## 🏗️ Docker Security Features

### Security Scanning in Build
The Dockerfile includes security scanning steps:
```dockerfile
# Runs security audits during build
RUN npm run security:audit || echo "Security audit completed with warnings"
```

### Container Security Best Practices
- ✅ **Non-root user**: Application runs as `appuser`
- ✅ **Minimal base image**: Uses Alpine Linux
- ✅ **Multi-stage build**: Reduces final image size
- ✅ **Health checks**: Built-in application health monitoring
- ✅ **Signal handling**: Proper process management with dumb-init

## 🔄 Continuous Security (CI/CD)

### GitHub Actions Integration
- **Automated security scans** on every push/PR
- **Daily security audits** via scheduled workflows
- **Multi-Node.js version** compatibility testing
- **Container image scanning** for Docker builds

### Workflow Features
- NPM audit for both frontend and backend
- Snyk vulnerability scanning
- Docker container security analysis
- Automatic monitoring on main branch

## 📊 Security Monitoring

### Snyk Dashboard
- Monitor all project dependencies
- Get alerts for new vulnerabilities
- Track fix status and progress
- View security trends over time

### NPM Audit Reports
```bash
# Generate detailed audit report
npm audit --json > security-report.json

# Check specific severity levels
npm audit --audit-level=moderate
npm audit --audit-level=high
```

## 🚨 Vulnerability Response Plan

### 1. **Immediate Response** (Critical/High Severity)
```bash
# Check for immediate threats
npm run security:all

# Apply automatic fixes
npm run security:fix

# Manual review of remaining issues
npx snyk test --severity-threshold=high
```

### 2. **Assessment & Prioritization**
- Review vulnerability details in Snyk dashboard
- Assess impact on application functionality
- Prioritize based on:
  - Severity score (CVSS)
  - Exploitability
  - Exposure level
  - Business impact

### 3. **Remediation**
- **Upgrade**: Update to patched versions
- **Patch**: Apply Snyk patches if available  
- **Workaround**: Implement temporary mitigations
- **Accept**: Document accepted risks with justification

### 4. **Verification**
```bash
# Verify fixes resolved issues
npm run security:all

# Test application functionality
npm test

# Deploy and monitor
```

## 🔐 Security Configuration

### `.snyk` Policy File
Control Snyk behavior with the `.snyk` file:
```yaml
# Ignore specific vulnerabilities (use sparingly)
ignore:
  SNYK-JS-EXAMPLE-123456:
    - '*':
      reason: "False positive - not exploitable in our use case"
      expires: '2024-12-31T23:59:59.999Z'
```

### NPM Audit Configuration
```json
{
  "audit": {
    "level": "moderate",
    "fund": false
  }
}
```

## 📈 Security Metrics

### Track These KPIs
- **Time to patch**: Average time from vulnerability discovery to fix deployment
- **Vulnerability density**: Number of vulnerabilities per KLOC
- **Critical/High severity count**: Focus on most dangerous issues
- **Patch coverage**: Percentage of known vulnerabilities patched

### Regular Security Activities
- [ ] **Weekly**: Review Snyk dashboard for new alerts
- [ ] **Monthly**: Run comprehensive security audit
- [ ] **Quarterly**: Security architecture review
- [ ] **As needed**: Emergency response for zero-day exploits

## 🆘 Emergency Response (Zero-Day)

### Immediate Actions
1. **Assess impact**: Does vulnerability affect our dependencies?
2. **Isolate**: Remove affected packages if possible
3. **Monitor**: Check Snyk/NPM advisories for patches
4. **Communicate**: Notify team and stakeholders
5. **Patch**: Apply fixes as soon as available
6. **Verify**: Test thoroughly before deployment

### Contact & Resources
- **Snyk Support**: [support.snyk.io](https://support.snyk.io)
- **NPM Security**: [npmjs.com/advisories](https://npmjs.com/advisories)
- **CVE Database**: [cve.mitre.org](https://cve.mitre.org)
- **GitHub Security**: [github.com/advisories](https://github.com/advisories)

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant and keep dependencies updated! 🔒

