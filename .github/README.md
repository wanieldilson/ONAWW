# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD, security scanning, and dependency management for the One Night a Werewolf project.

## 🔄 Workflows Overview

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests to `main`

**Features**:
- ✅ Runs tests for both frontend and backend
- 🏗️ Builds the application
- 🔒 Performs security scanning (npm audit, Snyk, Trivy)
- 🐳 Docker security scanning
- 🧪 CodeQL analysis for code quality
- 📦 Publishes Docker image to GitHub Container Registry (main branch only)
- 📋 Generates SBOM (Software Bill of Materials)

### 2. Security Scanning (`security-scan.yml`)
**Triggers**: Daily at 2 AM UTC, Manual trigger, Security file changes

**Features**:
- 🔍 Comprehensive dependency scanning
- 🛡️ Snyk vulnerability detection
- 📊 Trivy filesystem and configuration scanning
- 🐳 Docker security analysis with Docker Bench
- 📈 Semgrep static analysis (comprehensive mode)
- 📝 Security report generation

### 3. Docker Publishing (`docker-publish.yml`)
**Triggers**: Push to `main`, Version tags, Manual trigger

**Features**:
- 🏗️ Multi-architecture builds (AMD64, ARM64)
- 🔒 Container image signing with Cosign
- 📋 SBOM and provenance attestation
- 🔍 Post-build security scanning
- 🚀 Staging deployment integration
- 📢 Deployment notifications

### 4. Dependency Updates (`dependency-update.yml`)
**Triggers**: Weekly (Mondays at 9 AM UTC), Manual trigger

**Features**:
- 🔒 Automatic security updates
- 📊 Dependency review reports
- 🤖 Renovate configuration setup
- 📝 Automated pull requests for updates

## 🔧 Setup Instructions

### Required Secrets

Add these secrets to your GitHub repository:

1. **SNYK_TOKEN** (Optional but recommended)
   - Sign up at [Snyk.io](https://snyk.io)
   - Get your API token from Account Settings
   - Add as repository secret

2. **GITHUB_TOKEN** (Automatically provided)
   - Used for publishing to GitHub Container Registry
   - No setup required

### Required Permissions

Ensure your repository has these permissions enabled:
- **Actions**: Read and write
- **Contents**: Read and write
- **Packages**: Write
- **Security events**: Write
- **Pull requests**: Write

### Package Registry Setup

1. Go to your repository Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

## 🐳 Docker Images

Images are published to: `ghcr.io/[username]/[repository]`

**Available tags**:
- `latest` - Latest stable release (main branch)
- `main-[sha]` - Specific commit from main branch
- `v*` - Version tags (if you use semantic versioning)

**Pull the image**:
```bash
docker pull ghcr.io/[username]/onaww:latest
```

## 🔒 Security Features

### Vulnerability Scanning
- **npm audit**: Checks for known vulnerabilities in dependencies
- **Snyk**: Advanced vulnerability detection and license compliance
- **Trivy**: Comprehensive security scanner for containers and filesystems
- **CodeQL**: GitHub's semantic code analysis
- **Semgrep**: Static analysis for security issues

### Container Security
- **Multi-stage builds**: Minimizes attack surface
- **Non-root user**: Containers run as unprivileged user
- **Security scanning**: Images scanned before publishing
- **Signing**: Images signed with Cosign for integrity
- **SBOM**: Software Bill of Materials for transparency

### Dependency Management
- **Automated updates**: Security patches applied automatically
- **Renovate ready**: Configuration for advanced dependency management
- **Regular audits**: Weekly security scans

## 🚀 Usage Examples

### Manual Security Scan
```bash
# Trigger comprehensive security scan
gh workflow run security-scan.yml -f scan_level=comprehensive
```

### Manual Docker Build
```bash
# Build and push Docker image
gh workflow run docker-publish.yml -f push_to_registry=true
```

### Manual Dependency Update
```bash
# Update security dependencies only
gh workflow run dependency-update.yml -f update_type=security -f create_pr=true
```

## 📊 Monitoring and Reports

### Security Dashboard
- Check the "Security" tab in your repository for vulnerability reports
- SARIF files are uploaded automatically for security findings
- CodeQL results show code quality issues

### Artifacts
Each workflow run generates artifacts:
- **SBOM files**: Software bill of materials
- **Security reports**: Detailed vulnerability information
- **Dependency reports**: Outdated package information

### Notifications
- Failed workflows trigger GitHub notifications
- Security issues are reported in the Security tab
- Pull requests are created automatically for dependency updates

## 🛠️ Customization

### Environment Variables
Modify these in the workflow files:
- `NODE_VERSION`: Node.js version (default: 18)
- `PLATFORMS`: Docker build platforms
- `REGISTRY`: Container registry (default: ghcr.io)

### Security Thresholds
Adjust severity levels in workflow files:
- `--audit-level moderate`: npm audit threshold
- `--severity-threshold=high`: Snyk threshold
- `severity: 'HIGH,CRITICAL'`: Trivy threshold

### Scheduling
Modify cron expressions for different schedules:
- Security scans: `'0 2 * * *'` (daily at 2 AM)
- Dependency updates: `'0 9 * * 1'` (Mondays at 9 AM)

## 🤝 Contributing

When contributing to this project:
1. All workflows will run automatically on pull requests
2. Security scans must pass before merging
3. Docker images are only published from the main branch
4. Review security findings in the GitHub Security tab

## 🆘 Troubleshooting

### Common Issues

**Snyk token missing**:
- Security scans will skip Snyk steps if token is not configured
- Add SNYK_TOKEN secret to enable full scanning

**Docker build failures**:
- Check if multi-architecture builds are supported
- Verify Dockerfile syntax and dependencies

**Permission errors**:
- Ensure workflow permissions are correctly configured
- Check if GITHUB_TOKEN has sufficient permissions

### Getting Help
- Check workflow run logs for detailed error messages
- Review the Security tab for vulnerability details
- Open an issue if you encounter persistent problems
