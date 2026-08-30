# Security Standard

## Authentication (NextAuth v5)
- **Providers**: Google OAuth, Email (magic link)
- **Session**: JWT strategy
- **Callbacks**: signIn, session, jwt
- **Edge runtime**: proxy.ts handles auth checks

## Authorization
- **Roles**: USER, COACH, ADMIN
- **Route protection**: proxy.ts checks session + role
- **API protection**: requireAuth() helper in all routes

## API Security
- **Rate limiting**: 10 req/60s general, 5 req/60s auth, 3 req/60s password reset
- **Input validation**: Zod schemas on all endpoints
- **Error handling**: Never expose internals in production
- **Logging**: Sanitized errors only

## Data Protection
- **Passwords**: bcrypt hashed (12 rounds)
- **Secrets**: Environment variables only
- **PII**: Client data isolated by userId
- **Export**: Full data export available (GDPR)
- **Deletion**: Cascade delete on account removal

## Payment Security
- **Stripe**: Server-side only
- **Webhook**: Signature verification
- **No card storage**: Stripe handles PCI compliance

## Frontend Security
- **CSP**: Content Security Policy headers
- **XSS Prevention**: React auto-escapes, sanitize user input
- **CSRF**: SameSite cookies
- **Cookie consent**: GDPR compliance

## Monitoring
- **Sentry**: Error tracking with source maps
- **Logging**: Structured JSON logs
- **Alerts**: At-risk user detection

## Audit Checklist
- [x] No secrets in code
- [x] Rate limiting on all endpoints
- [x] Input validation with Zod
- [x] Role-based access control
- [x] Secure session handling
- [x] Payment webhook verification
- [x] Error sanitization
- [x] Cookie consent
- [x] Data export capability
- [x] Account deletion with cascade
