# QR Food Ordering System

A modern food ordering system with QR code support, built with Next.js 14, TypeScript, and Supabase.

## Features

### Customer Features
- Browse menu with categories
- Add items to cart
- Place orders via QR code
- Track order status in real-time
- Support for both Restaurant and Market modes

### Admin Features
- Menu management (categories, items)
- Order management
- Table management
- Settings and customization
- Real-time order notifications

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase subscriptions
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
qr-food-ordering/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard routes
│   ├── customer/          # Customer-facing routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   └── customer/         # Customer-specific components
├── lib/                   # Utilities and libraries
│   ├── store/            # Zustand stores
│   ├── supabase/         # Supabase clients
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Environment Variables

See `.env.example` for required environment variables.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC
