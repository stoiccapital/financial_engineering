# Financial Engineering App

A full-stack financial tracking application built with Next.js, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication (Login/Signup)
- 📊 Dashboard
- 💰 Income & Expense Tracker
- 📈 Net Worth Tracker
- 📋 Budget Planner

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd financial-engineering
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific components and logic
│   ├── auth/
│   ├── dashboard/
│   ├── incomeExpense/
│   ├── networth/
│   └── budgetPlanner/
├── hooks/         # Custom React hooks
├── lib/           # Library configurations (Supabase)
├── pages/         # Next.js pages
├── styles/        # Global styles and Tailwind config
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application is configured for deployment on Vercel. Simply connect your repository to Vercel and set up the environment variables in the Vercel dashboard.

## License

MIT 