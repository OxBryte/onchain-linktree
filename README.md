# Onchain Linktree

A modern React app that showcases onchain profiles and links. The Home page features a polished hero and schedule timeline built entirely with Tailwind CSS utilities.

## Features

- Elegant hero section with CTAs and subtle glassmorphism
- Timeline/schedule card stack with soft shadows and rotations
- Client-side routing for usernames (e.g. `/vitalik`)
- Fully styled using Tailwind CSS v4 (no custom CSS needed)

## Tech Stack

- React 19 + Vite 7
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite`)

## Packages Used

Runtime:

- `react`, `react-dom`
- `react-router-dom`
- `tailwindcss`
- `@tailwindcss/vite`
- Web3 stack: `wagmi`, `viem`, `@reown/appkit`, `@reown/appkit-adapter-wagmi`
- State/data: `@tanstack/react-query`

Dev/Tooling:

- `vite`, `@vitejs/plugin-react`
- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Tailwind Setup

Tailwind v4 is enabled via the Vite plugin and a single import:

- `vite.config.js` adds the plugin
- `src/index.css` contains `@import "tailwindcss";`

Use Tailwind utility classes directly in JSX (see `src/pages/Home.jsx`).

## Project Structure

```
src/
  main.jsx          # App bootstrap
  App.jsx           # Routes
  pages/
    Home.jsx        # Tailwind hero + timeline
    UserProfile.jsx # Username route
  index.css         # Tailwind import
```

## License

MIT
