# Security Guidelines

## Environment Variables

### Required GitHub Secrets

To deploy this application securely, configure the following secrets in your GitHub repository:

#### Production Environment
- `PROD_COUNTER_WORKSPACE`: Production counter workspace name (default: `perhitsiksha`)
- `GA_MEASUREMENT_ID`: Google Analytics measurement ID for production

#### Staging Environment (Optional)
- `STAGING_COUNTER_WORKSPACE`: Staging counter workspace name (default: same as production)
- `GA_STAGING_ID`: Google Analytics measurement ID for staging

#### Development Environment (Optional)
- `DEV_COUNTER_WORKSPACE`: Development counter workspace name (default: same as production)

### Environment Configuration Files

❌ **DO NOT COMMIT** environment files (`.env.*`) to version control:
- `.env.development`
- `.env.staging`
- `.env.production`

✅ **ONLY COMMIT** the example file:
- `.env.example`

### Local Development Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.development
   ```

2. Configure your local environment variables in `.env.development`

## Counter API Security

The Counter API (counterapi.dev) is used for tracking pageviews:
- **No authentication required** for public counters
- **No sensitive data** is transmitted
- **Request timeouts** are implemented to prevent hanging requests
- **AbortController** prevents memory leaks on component unmount

## Content Security Policy

The application implements CSP-friendly practices:
- No inline scripts or styles
- Proper nonce handling for dynamic content
- External resources are properly configured

## Dependency Security

- Regular security audits via `npm audit`
- Automated dependency updates via GitHub Dependabot
- Husky pre-commit hooks prevent committing sensitive data

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Contact the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for the issue to be addressed

## Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded secrets or API keys
- [ ] Environment variables used for configuration
- [ ] Proper input validation and sanitization
- [ ] AbortController cleanup for async operations
- [ ] No console.log in production builds
- [ ] Dependencies are up to date and audited

## Deployment Security

### GitHub Actions

- Use GitHub secrets for sensitive data
- Environment-specific configurations
- Proper access controls and permissions
- Artifact cleanup and retention policies

### Build Security

- Source maps disabled in production
- Minification and obfuscation enabled
- Asset integrity verification
- Bundle size monitoring

## Browser Security

- Secure headers implementation
- HTTPS enforcement
- Cross-origin request handling
- Local storage data validation