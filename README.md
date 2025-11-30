# AI Benefits Tracker

A comprehensive web application for tracking and measuring the benefits of AI initiatives across an organization. Built with Next.js 15, TypeScript, Prisma, and shadcn/ui.

## Features

- **Executive Dashboard**: High-level overview of all AI initiatives with key metrics
- **Project Management**: Track AI projects from planning to production
- **ROI Tracking**: Calculate and monitor return on investment for each project
- **Risk Management**: Identify and mitigate risks with interactive risk matrix
- **AI Agents Performance**: Monitor AI agent performance metrics and trends
- **Prompt Library**: Centralized repository for AI prompts with usage tracking
- **Interactive Roadmap**: Visual timeline with phases and milestones
- **Reports & Analytics**: Comprehensive reporting with exportable templates

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
cd ai-benefits-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Seed the database with sample data:
```bash
npx tsx prisma/seed.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ai-benefits-tracker/
├── app/                      # Next.js app directory
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── page.tsx         # Executive dashboard
│   │   ├── projects/        # Projects management
│   │   ├── agents/          # AI agents tracking
│   │   ├── prompts/         # Prompt library
│   │   ├── risks/           # Risk management
│   │   ├── roadmap/         # Project roadmaps
│   │   └── reports/         # Reports & analytics
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   └── roadmap/             # Roadmap visualization components
├── lib/
│   ├── db.ts                # Prisma client
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
└── prisma/
    ├── schema.prisma        # Database schema
    └── seed.ts              # Seed data script
```

## Key Features Explained

### Dashboard
The executive dashboard provides a comprehensive overview with:
- Total projects count and status distribution
- Average ROI across all initiatives
- Total cost savings achieved
- Critical risks that need attention
- Recent activity and alerts

### Projects
Track AI projects through their lifecycle:
- Project categories: AI Initiative, AI Agent, Prompt Library, Gen AI Production, Risk Management
- Status tracking: Planning, Pilot, Scaling, Production, Paused, Completed, Cancelled
- Budget tracking and ROI calculations
- KPI monitoring with targets
- Risk assessments and feedback collection

### AI Agents
Monitor AI agent performance with:
- Success rates and task completion metrics
- Autonomy scores and accuracy metrics
- User satisfaction ratings
- Error rates and average completion times
- Performance trends over time

### Prompt Library
Centralized prompt management:
- Categorized prompt collection
- Usage tracking and ratings
- Tag-based organization
- Search and filtering
- Author attribution

### Roadmap
Visual project implementation timeline:
- Phase-based project tracking
- Milestone management with completion status
- Progress percentage tracking
- Dependency visualization
- Overdue milestone alerts

### Risk Management
Comprehensive risk tracking:
- Risk matrix visualization (Severity × Likelihood)
- Risk scoring and categorization
- Mitigation plan tracking
- Status workflow management
- Compliance checking

## Database Schema

The application uses a comprehensive Prisma schema with the following main models:

- **AIProject**: Core project information
- **KPIDefinition**: KPI definitions for projects
- **MetricTimeseries**: Time-series metrics data
- **ROICalculation**: ROI calculations over time
- **AgentPerformance**: AI agent performance metrics
- **PromptLibrary**: Prompt collection
- **RiskAssessment**: Risk tracking
- **Phase & Milestone**: Roadmap data
- **Alert**: Notification system
- **UserFeedback**: User feedback collection

## API Routes

The application provides RESTful API endpoints:

- `/api/dashboard/summary` - Dashboard summary data
- `/api/projects` - Project CRUD operations
- `/api/metrics` - Metrics time-series data
- `/api/roi` - ROI calculations
- `/api/risks` - Risk assessments
- `/api/agents` - Agent performance data
- `/api/prompts` - Prompt library
- `/api/roadmap` - Roadmap and milestones
- `/api/alerts` - Alert management

## Development

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Database Migrations

After modifying the Prisma schema:

```bash
npx prisma migrate dev --name [migration-name]
```

### TypeScript Types

Types are automatically generated from Prisma schema and extended in `lib/types.ts`.

## Deployment

### Quick Deploy to Vercel (Recommended)

```bash
./deploy-to-vercel.sh
```

Or manually:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Add Postgres database in Vercel Dashboard
# Go to Storage → Create Database → Postgres

# 4. Pull environment variables
vercel env pull .env.local

# 5. Run migrations
npx prisma migrate dev --name init_postgres

# 6. Seed database
npx tsx prisma/seed.ts

# 7. Deploy to production
vercel --prod
```

📚 **Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)  
⚡ **Quick reference**: See [QUICK-START-VERCEL.md](./QUICK-START-VERCEL.md)

### Environment Variables

When deploying to Vercel with Postgres, these are automatically configured:
- `POSTGRES_PRISMA_URL`: Pooled connection (primary)
- `POSTGRES_URL_NON_POOLING`: Direct connection (for migrations)
- `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

For local development with Vercel Postgres:
```bash
vercel env pull .env.local
```

### Alternative Deployments

**Railway / Render / Fly.io**: Update `prisma/schema.prisma` datasource and environment variables accordingly.

**Docker**: Use the included `Dockerfile` (create one if needed) with PostgreSQL.

### Build for Production (Self-Hosted)

```bash
npm run build
npm start
```

## Contributing

This is a prototype application demonstrating AI benefits tracking capabilities. Feel free to extend and customize based on your organization's needs.

## License

MIT
