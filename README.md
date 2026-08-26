# Chocolate — Artisan Pastry in Valencia

Handcrafted artisan pastry made with love in Valencia, Spain. Order Rogel, Marquise, Key Lime Pie and more.

## Prerequisites

- [Node.js](https://nodejs.org/) and npm (or [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

## Getting started

```sh
# Install dependencies
npm install

# Start the development server (runs on http://localhost:8080)
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (port 8080) |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Tech stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Deployment

Build the app with `npm run build`; the output is in the `dist/` folder. Deploy `dist/` to any static host (e.g. Vercel, Netlify, GitHub Pages, or your own server).

## Auth / passwords

Copy `.env.example` to `.env.local` and fill in the values.

Password recovery emails are sent by Supabase Auth (`resetPasswordForEmail`). No Resend domain is required for this flow.

In the Supabase Dashboard → Authentication → URL Configuration, set the Site URL and add Redirect URLs for every origin you use:

- `http://localhost:8080/nueva-contrasena`
- `https://your-domain.com/nueva-contrasena`

Supabase rejects any redirect that is not on that list. Check spam if the mail does not arrive; the default sender is a Supabase address.

Order confirmation emails still go through Resend (`RESEND_API_KEY`, `RESEND_FROM`).
