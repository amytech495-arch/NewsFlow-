# 📰 NewsFlow — News to Telegram to Facebook

**NewsFlow** is a full-stack news automation pipeline that fetches news articles from multiple APIs, optionally rewrites them with AI (Gemini), and publishes them to your Telegram channel and Facebook page — all from a beautiful dark-themed dashboard.

## ✨ Features

### 🔄 News Pipeline
- **Multi-API Fetching** — Pulls news from 5 APIs with automatic rotation (NewsAPI, GNews, NewsData.io, Currents API, TheNewsAPI)
- **RSS Feed Support** — Add custom RSS sources (BBC, CNN, Reuters, etc.)
- **AI Rewriting** — Gemini-powered rewriter that makes articles sound human, not AI-generated
- **Telegram Publishing** — Auto-posts to your Telegram channel with images, hashtags, and formatting
- **Facebook Publishing** — Auto-posts to your Facebook page
- **Deduplication** — URL hash + title-based dedup prevents duplicate posts across APIs and cycles

### 🎛️ Dashboard & Controls
- **Real-time Dashboard** — Live stats, pipeline status, connection indicators, recent activity
- **Automation Engine** — Run full cycles or individual steps (fetch → rewrite → Telegram → Facebook)
- **Post Count Control** — Choose how many posts to send per cycle (1–20)
- **Remove Links Toggle** — Strip URLs from posts for cleaner social media content
- **Activity Logs** — Full history of every action with clear/filter options

### 🔌 Connections
- **Live Connection Checks** — Real-time ping to verify Telegram bot and Facebook page connectivity
- **Test Messages** — Send test posts to verify everything works before running a cycle
- **Frontend Token Updates** — Update API keys directly from the UI (PIN-protected: `1966`)

### 🌐 Internationalization (i18n)
- **15 Languages** — English, Spanish, French, German, Portuguese, Arabic, Chinese, Hindi, Japanese, Korean, Russian, Turkish, Igbo, Yoruba, Hausa
- **Full App Translation** — Every label, button, message, and modal is translated (~269 keys per language)

### 🎨 Design
- **Dark Navy Theme** — Deep dark navy color scheme with purple/blue accents
- **Light/Dark/System Modes** — Full theme support with ThemeContext
- **Mobile Optimized** — Responsive design, no GPU-heavy CSS effects
- **Animated Branding** — Subtle NewsFlow icon animation in the header

### 🔐 Authentication
- **Email/Password** — Sign up and sign in with email
- **Google OAuth** — One-click Google sign-in
- **Cloudflare Turnstile** — Bot protection on auth forms

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui |
| **Backend** | Convex (real-time database, serverless functions) |
| **Auth** | @convex-dev/auth (Password + Google OAuth) |
| **AI** | Google Gemini 2.0 Flash |
| **APIs** | NewsAPI, GNews, NewsData.io, Currents, TheNewsAPI |
| **Platforms** | Telegram Bot API, Facebook Graph API v21.0 |

## 📁 Project Structure

```
newsflow-v2/
├── convex/                    # Backend (Convex serverless functions)
│   ├── schema.ts              # Database schema (articles, logs, settings, customSources)
│   ├── pipeline.ts            # Core pipeline: fetch, rewrite, send to Telegram/Facebook
│   ├── articles.ts            # Article queries, mutations, stats, analytics
│   ├── logs.ts                # Activity log queries and mutations
│   ├── apiKeys.ts             # Frontend-updatable API key storage
│   ├── customSources.ts       # Custom RSS source CRUD
│   ├── auth.ts                # Auth configuration (Password + Google)
│   └── auth.config.ts         # Auth provider config
├── src/
│   ├── pages/                 # All app pages
│   │   ├── DashboardPage.tsx  # Main dashboard with stats and pipeline status
│   │   ├── SourcesPage.tsx    # API connections + custom RSS sources
│   │   ├── TelegramPage.tsx   # Telegram channel management
│   │   ├── FacebookPage.tsx   # Facebook page management
│   │   ├── AutomationPage.tsx # Pipeline automation controls
│   │   ├── PostsPage.tsx      # Published posts history
│   │   ├── LogsPage.tsx       # Activity history with clear option
│   │   ├── RulesPage.tsx      # AI rewrite and posting rules
│   │   ├── AnalyticsPage.tsx  # Weekly charts and stats
│   │   ├── SettingsPage.tsx   # General, notifications, appearance, data settings
│   │   ├── HelpPage.tsx       # Help and documentation
│   │   ├── LoginPage.tsx      # Sign in with Turnstile
│   │   └── SignupPage.tsx     # Sign up with Turnstile
│   ├── components/
│   │   ├── AppLayout.tsx      # Main app layout with sidebar + header
│   │   ├── AppSidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx         # Top header with animated icon + notifications
│   │   ├── PublicLayout.tsx   # Layout for public/auth pages
│   │   └── ui/               # shadcn/ui components (53 components)
│   ├── contexts/
│   │   ├── ThemeContext.tsx    # Light/dark/system theme management
│   │   └── TranslationContext.tsx  # i18n with 15 languages (~4200 lines)
│   └── hooks/                 # Custom React hooks
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Convex account ([convex.dev](https://convex.dev))

### Installation

```bash
# Clone the repo
git clone https://github.com/amytech495-arch/NewsFlow-.git
cd NewsFlow-

# Install dependencies
npm install
# or
bun install

# Set up Convex
npx convex dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=your_deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# News APIs (at least 1 required)
NEWSAPI_KEY=your_key
GNEWS_KEY=your_key
NEWSDATA_KEY=your_key
CURRENTS_KEY=your_key
THENEWSAPI_KEY=your_key

# Telegram Bot
TELEGRAM_TOKEN=your_bot_token
TELEGRAM_CHANNEL=@your_channel

# Facebook Page
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_TOKEN=your_page_token

# AI Rewriting
GEMINI_API_KEY=your_gemini_key

# Auth (optional)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_secret

# Cloudflare Turnstile (optional)
VITE_CLOUDFLARE_SITE_KEY=your_site_key
CLOUDFLARE_SECRET_KEY=your_secret_key
```

Set Convex environment variables:
```bash
npx convex env set NEWSAPI_KEY your_key
npx convex env set TELEGRAM_TOKEN your_bot_token
# ... repeat for all keys
```

### Development

```bash
# Start Convex backend (terminal 1)
npx convex dev

# Start frontend (terminal 2)
npm run dev
# or
bun run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `articles` | Fetched news articles with send status, AI rewrites, dedup hash |
| `logs` | Activity history (fetch, telegram, facebook, automation, ai, error) |
| `settings` | Key-value app settings (API keys, preferences) |
| `customSources` | User-added RSS feed sources |

## 🔑 API Key Management

Keys are resolved in priority order:
1. **Database** (updatable from Settings page, PIN-protected)
2. **Environment variables** (Convex env)
3. **Hardcoded fallbacks** (for development only)

## 📜 License

MIT

---

*Built with ❤️ by Leo — Powered by Convex, React, and Gemini AI*
