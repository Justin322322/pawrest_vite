# PawRest - Pet Memorial Services Platform

A compassionate platform connecting pet parents with memorial service providers to honor beloved companions with dignity and love.

## Features

- 🏠 **Home Page**
  - Interactive hero section
  - Service showcase
  - How it works guide
  - Client testimonials
  - FAQ section
  
- 👤 **User Authentication**
  - Client registration & login
  - Service provider onboarding
  - Secure authentication flow

- 📊 **Dashboards**
  - Client dashboard for managing memorial services
  - Provider dashboard with booking management
  - Service analytics and insights

- 💼 **Service Management**
  - Multiple service types (Cremation, Memorials, Ceremonies)
  - Booking system
  - Provider verification system
  - Review and rating system

## Tech Stack

- **Frontend**
  - React with TypeScript
  - TailwindCSS for styling
  - Radix UI components
  - React Query for data fetching
  - Wouter for routing

- **Backend**
  - Node.js with Express
  - TypeScript
  - Drizzle ORM
  - PostgreSQL database
  - Express Session for auth

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Justin322322/pawrest_vite.git
   cd pawrest_vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5000](http://localhost:5000) in your browser

## Project Structure

```
client/           # Frontend React application
  ├── src/
  │   ├── components/  # Reusable UI components
  │   ├── hooks/      # Custom React hooks
  │   ├── lib/        # Utility functions
  │   └── pages/      # Page components
server/           # Backend Express server
  ├── auth.ts     # Authentication logic
  ├── routes.ts   # API routes
  └── storage.ts  # Data storage layer
shared/           # Shared TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.