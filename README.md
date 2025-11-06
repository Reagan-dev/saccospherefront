# SaccoSphere Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 📦 Axios for HTTP requests
- 🏗️ Professional file structure

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configurations
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── App.tsx         # Main App component
├── main.tsx        # Application entry point
└── index.css       # Global styles with Tailwind
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

- Axios instance is configured in `src/lib/axios.ts`
- Tailwind CSS configuration is in `tailwind.config.js` with primary color (Deep Indigo #4F46E5)
- TypeScript configuration is in `tsconfig.json`

## Design System

- **Primary Color**: Deep Indigo (#4F46E5) - Use `primary` or `primary-{shade}` in Tailwind classes
- **Utility Functions**:
  - `cn()` - Merge Tailwind classes with conflict resolution (from `src/lib/utils.ts`)
  - `formatCurrency()` - Format numbers as Kenyan Shilling (KES) currency (from `src/lib/utils.ts`)

### Example Usage

```tsx
import { cn, formatCurrency } from '@/lib/utils'

// Merge classes
const className = cn('px-4 py-2', isActive && 'bg-primary', 'text-white')

// Format currency
const price = formatCurrency(1234.56) // "KES 1,234.56"
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:3000/api
```
