# GitHub Actions Workflows

## ✅ Active Workflows

### 1. **CI** (`ci.yml`) - Main Continuous Integration
**Triggers**: Push to main/develop, Pull Requests  
**What it does**:
- ✅ Runs all tests (backend & frontend)
- ✅ Builds both applications
- ✅ Tests Docker build
- ✅ Runs basic security audits

**Jobs**:
- `test-and-build`: Installs dependencies, runs tests, builds code
- `docker-build`: Verifies Docker image builds successfully
- `security-check`: Runs npm audit on both packages

**Status**: ✅ **WORKING** - Simplified and streamlined

---

### 2. **Docker Build and Publish** (`docker-publish.yml`)
**Triggers**: Push to main, Tags (v*), Manual dispatch  
**What it does**:
- ✅ Builds multi-platform Docker images (amd64 & arm64)
- ✅ Publishes to GitHub Container Registry
- ✅ Generates SBOM (Software Bill of Materials)
- ✅ Signs images with Cosign
- ✅ Runs security scans on published images

**Jobs**:
- `build-and-publish`: Builds and pushes Docker images
- `security-scan`: Scans published images for vulnerabilities
- `image-signing`: Signs container images for supply chain security
- `notification`: Creates build summary

**Status**: ✅ **WORKING** - Package publication confirmed

---

## ⚠️ Legacy Workflows (May Need Attention)

### 3. **CI/CD Pipeline** (`ci-cd.yml`) - Comprehensive Pipeline
**Status**: ⚠️ **UPDATED** - Fixed npm ci → npm install issues  
**Contains**: Tests, security scanning, Docker security, CodeQL analysis  
**Note**: More comprehensive than `ci.yml` but also more complex

### 4. **PR Validation** (`pr-validation.yml`)
**Status**: ⚠️ **UPDATED** - Fixed dependency installation  
**Contains**: Validation checks, type checking, tests, build verification  
**Note**: May overlap with `ci.yml`

### 5. **Security Audit** (`security.yml`)
**Status**: ⚠️ **UPDATED** - Fixed npm install issues  
**Contains**: npm audit, Snyk scans on multiple Node versions  
**Note**: Requires SNYK_TOKEN secret to be configured

### 6. **Security Scanning** (`security-scan.yml`)
**Status**: ⚠️ **UPDATED** - Fixed dependency paths  
**Contains**: Comprehensive security scanning (Trivy, Snyk, Semgrep)  
**Note**: Very thorough but may have long run times

### 7. **Dependency Updates** (`dependency-update.yml`)
**Status**: ⚠️ **UPDATED** - Fixed npm install issues  
**Contains**: Automated dependency updates, Renovate config  
**Note**: Creates PRs for security updates

---

## 🔧 Common Fixes Applied

All workflows were updated to fix:
1. ❌ **Removed** `cache-dependency-path` pointing to non-existent `package-lock.json` files
2. ❌ **Changed** `npm ci` → `npm install` (project uses npm install, not lock files)
3. ✅ **Added** lint script to backend package.json
4. ✅ **Fixed** CodeQL build step to install subdirectory dependencies first

---

## 🎯 Recommended Workflow Strategy

### For Most Development:
Use **`ci.yml`** - Lightweight, fast, covers essentials

### For Production Releases:
Use **`docker-publish.yml`** - Full Docker build and publish pipeline

### For Security-Focused Work:
Enable **`security-scan.yml`** - Comprehensive security analysis

### Optional Enhancements:
- **Enable Renovate** via `dependency-update.yml` for automated updates
- **Configure Snyk** by adding `SNYK_TOKEN` secret
- **Enable CodeQL** in `ci-cd.yml` for code analysis

---

## 🔑 Required Secrets

For full functionality, configure these secrets in your GitHub repository:

- `GITHUB_TOKEN` - ✅ Automatically provided by GitHub
- `SNYK_TOKEN` - ⚠️ Optional, for Snyk security scanning
- `CODECOV_TOKEN` - ⚠️ Optional, for code coverage reporting

---

## 📊 Workflow Recommendations

### Minimal Setup (Start Here):
- Keep: `ci.yml`, `docker-publish.yml`
- Disable: Everything else until needed

### Standard Setup:
- Keep: `ci.yml`, `docker-publish.yml`, `pr-validation.yml`
- Enable: `security-scan.yml` (scheduled daily)

### Full Security Setup:
- Enable: All workflows
- Configure: SNYK_TOKEN secret
- Set up: Renovate for dependency automation

---

## 🚀 Quick Start

1. **Verify CI works**: Push a commit and watch `ci.yml` run
2. **Test Docker publish**: Create a tag `v1.0.0` and check `docker-publish.yml`
3. **Enable security**: Add SNYK_TOKEN and enable security workflows
4. **Monitor**: Check Actions tab for workflow results

---

**Last Updated**: October 3, 2025  
**Status**: ✅ Core workflows fixed and operational

