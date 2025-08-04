# 🪦 Project Graveyard

A digital cemetery where developers can respectfully "bury" abandoned projects, extract learnings, and discover patterns in their creative process.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Animations**: Framer Motion
- **State Management**: TanStack Query

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## 📋 Development Phases

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed development roadmap.

### Current Phase: Foundation (Week 1-2)
- ✅ Project setup and configuration
- ⏳ Supabase integration
- ⏳ Authentication flow
- ⏳ Basic UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.