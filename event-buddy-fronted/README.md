# Event Buddy — Frontend

Event Buddy Frontend is a modern, responsive event discovery and booking web app built with Next.js and React. Users can browse and register for events, while admins manage event listings, capacity, and media. The app integrates with a backend API and uses JWT-based authentication stored in the browser.


## Key Features

- **Users**
  - Browse paginated upcoming and previous events on `Dashboard` with search.
  - View detailed event pages with date, time, location, tags, description, and availability.
  - Book seats with auth-gated flow (unauthenticated users are redirected to `Signin` and then back to the event).
  - See "Spots Left" and total registered counts update immediately after booking.
  - Manage registrations in `Users` dashboard and cancel existing bookings.

- **Admins**
  - Create, edit, and delete events (title, description, date/time, location, capacity, tags, price, duration).
  - Upload and update event images.
  - Navigate to the admin panel via role-aware header redirection.

- **Authentication & UX**
  - JWT stored in `localStorage`; header shows the user’s display name when logged in.
  - Logout clears auth and redirects to `/dashboard`.
  - Public event pages; booking requires login with `next` redirect support.

  ## Folder Structure

```
└── 📁src
    └── 📁app
        └── 📁admin
            └── 📁create
                ├── page.tsx
            └── 📁edit
                └── 📁[id]
                    ├── page.tsx
            ├── page.tsx
        └── 📁components
            ├── EventCard.tsx
            ├── Footer.tsx
            ├── Header.tsx
            ├── Navbar.tsx
            ├── RequireAuth.tsx
            ├── SeatSelector.tsx
        └── 📁dashboard
            ├── page.tsx
        └── 📁event
            └── 📁[id]
                ├── page.tsx
        └── 📁signin
            ├── page.tsx
        └── 📁signup
            ├── page.tsx
        └── 📁types
            ├── event.ts
        └── 📁users
            ├── page.tsx
        └── 📁utils
            ├── api.ts
            ├── auth.ts
        ├── favicon.ico
        ├── globals.css
        └── layout.tsx
```


## Technology Stack (Frontend)

- **Framework**: Next.js `15.5.4`
- **UI**: React `19.1.0`, React DOM `19.1.0`
- **Styling**: Tailwind CSS `^4.1.14`, @tailwindcss/postcss `^4.1.14`, PostCSS `^8.5.6`
- **HTTP Client**: Axios `^1.12.2`
- **Icons**: react-icons `^5.5.0`
- **Language & Tooling**: TypeScript `^5`, ESLint `^9`, eslint-config-next `15.5.4`

Environment variable:
- `NEXT_PUBLIC_API_URL` — Base URL of the backend API (defaults to `http://localhost:3005`).

## Setup & Run

- **Prerequisites**
  - Node.js `>= 18` (LTS recommended)
  - A running backend API at `NEXT_PUBLIC_API_URL` (or `http://localhost:3005` by default)

- **Install dependencies**
  - `npm install`

- **Run in development**
  - `npm run dev`
  - Open `http://localhost:3000`

- **Build for production**
  - `npm run build`

- **Start production server**
  - `npm run dev`



---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
