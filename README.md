# NomiTips

Premium fitness platform for coaches and clients with workout programs, progress tracking, messaging, and subscription management.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Auth:** NextAuth v5
- **Payments:** Stripe
- **Email:** Resend
- **Storage:** Cloudinary
- **Realtime:** Socket.io
- **UI:** Tailwind CSS, Radix UI, shadcn/ui
- **Logging:** Pino
- **Error Tracking:** Sentry

## Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd nomitips
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Initialize database
npx prisma migrate dev
npm run db:seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | [Neon](https://neon.tech) |
| `AUTH_SECRET` | NextAuth secret | `openssl rand -base64 32` |
| `AUTH_URL` | Base URL (e.g., `http://localhost:3000`) | Your deployment URL |
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `STRIPE_PRICE_MONTHLY` | Monthly subscription price ID | [Stripe Products](https://dashboard.stripe.com/products) |
| `STRIPE_PRICE_ANNUAL` | Annual subscription price ID | [Stripe Products](https://dashboard.stripe.com/products) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [Cloudinary](https://console.cloudinary.com/app/settings/api-keys) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | [Cloudinary](https://console.cloudinary.com/app/settings/api-keys) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | [Cloudinary](https://console.cloudinary.com/app/settings/api-keys) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend email API key | - |
| `EMAIL_FROM` | Sender email address | `NomiTips <onboarding@resend.dev>` |
| `SENTRY_DSN` | Sentry DSN for error tracking | - |
| `HOSTNAME` | Server hostname | `localhost` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Log level (`debug`, `info`, `warn`, `error`) | `info` (production) / `debug` (development) |

## Production Deployment

```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Build
npm run build

# 3. Start
npm start
```

### Docker

```bash
docker build -t nomitips .
docker run -p 3000:3000 nomitips
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:push` | Push schema changes |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

## Project Structure

```
├── actions/          # Server actions
├── app/              # Next.js App Router
│   ├── api/          # API routes
│   └── (routes)      # Page routes
├── components/       # React components
├── lib/              # Utilities, auth, prisma, logger
├── prisma/           # Schema, migrations, seed
├── public/           # Static assets
├── server/           # Server-side services
│   ├── services/     # Business logic
│   └── socket/       # Socket.io handlers
└── types/            # TypeScript types
```
