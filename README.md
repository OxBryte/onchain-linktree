# Onchain Linktree

A modern React app that showcases onchain profiles and links. The Home page features a polished hero and schedule timeline built entirely with Tailwind CSS utilities.

## Features

- **Wallet Connection via Reown AppKit (WalletConnect)**
  - Multi-wallet support (MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, etc.)
  - Mobile wallet support via QR code scanning
  - Seamless connection experience with beautiful UI
  - Automatic wallet detection and connection state management
  
- Elegant hero section with CTAs and subtle glassmorphism
- Timeline/schedule card stack with soft shadows and rotations
- Client-side routing for usernames (e.g. `/vitalik`)
- Fully styled using Tailwind CSS v4 (no custom CSS needed)
- **Discover page** - Browse all registered users and explore profiles
- Dashboard for managing your onchain profile
- **Admin Dashboard** - Track user interactions, analytics, and platform metrics
- Transaction notifications with react-hot-toast (shows transaction hash and explorer links)
- Auto-redirect to dashboard if user already has a profile

## Tech Stack

- React 19 + Vite 7
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Web3 Integration**: wagmi + viem + **Reown AppKit** (WalletConnect)

## Packages Used

Runtime:

- `react`, `react-dom`
- `react-router-dom`
- `tailwindcss`
- `@tailwindcss/vite`
- Web3 stack: `wagmi`, `viem`, `@reown/appkit`, `@reown/appkit-adapter-wagmi`
- State/data: `@tanstack/react-query`
- Notifications: `react-hot-toast`
- Charts: `apexcharts`, `react-apexcharts`

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

## Wallet Connection with Reown AppKit (WalletConnect)

This application uses **Reown AppKit** (formerly WalletConnect) for seamless wallet connection and Web3 interactions. Reown AppKit provides a unified interface for connecting to multiple wallet providers including MetaMask, WalletConnect, Coinbase Wallet, and many more.

### Why Reown AppKit?

- **Multi-Wallet Support**: Users can connect with any wallet provider through a single interface
- **WalletConnect Protocol**: Enables mobile wallet connections via QR code scanning
- **Beautiful UI**: Pre-built, customizable wallet connection modal
- **Cross-Chain Support**: Easily switch between different blockchain networks
- **Secure**: Implements WalletConnect's secure protocol for wallet connections

### Reown AppKit Setup

The app is wrapped with `AppKitProvider` in `src/Provider.jsx`:

```jsx
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

// Create Wagmi Adapter with network configuration
const wagmiAdapter = new WagmiAdapter({
  networks: [base], // Base Mainnet
  projectId: import.meta.env.VITE_APPKIT_PROJECT_ID,
  ssr: true,
})

// Initialize Reown AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId: import.meta.env.VITE_APPKIT_PROJECT_ID,
  metadata: {
    name: "Onchain Linktree",
    description: "Decentralized Link Hub",
    url: "https://onchain-linktree.com",
    icons: ["/logo.png"],
  },
  features: {
    analytics: true,
  },
})

// Wrap app with providers
export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Using Reown AppKit Hooks

#### Connect Wallet

```jsx
import { useAppKit } from '@reown/appkit/react'

function MyComponent() {
  const { open } = useAppKit()
  
  return (
    <button onClick={() => open()}>
      Connect Wallet
    </button>
  )
}
```

#### Check Connection Status

```jsx
import { useAppKitAccount } from '@reown/appkit/react'

function MyComponent() {
  const { isConnected, address } = useAppKitAccount()
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>
  }
  
  return <div>Connected: {address}</div>
}
```

#### Disconnect Wallet

```jsx
import { useDisconnect } from '@reown/appkit/react'

function MyComponent() {
  const { disconnect } = useDisconnect()
  
  return (
    <button onClick={disconnect}>
      Disconnect
    </button>
  )
}
```

### Wallet Connection Flow

1. User clicks "Connect Wallet" button
2. Reown AppKit modal opens showing available wallet options
3. User selects their preferred wallet (MetaMask, WalletConnect, etc.)
4. For mobile wallets, QR code is displayed for scanning
5. User approves connection in their wallet
6. App receives connection status and wallet address via `useAppKitAccount()`
7. User can now interact with smart contracts on-chain

### Environment Variables

```bash
# Required for contract calls
VITE_USER_DATA_CONTRACT_ADDRESS=0xYourContractAddress

# Required for Reown AppKit wallet modal and WalletConnect
# Get your project ID from: https://cloud.reown.com
VITE_APPKIT_PROJECT_ID=your_project_id
```

To get your Reown AppKit Project ID:
1. Visit [Reown Cloud](https://cloud.reown.com)
2. Create a new project or use an existing one
3. Copy your Project ID
4. Add it to your `.env` file

## Smart Contract Integration

Contract ABI is centralized in:

- `src/lib/abi/userDataContract.js` (export: `userDataAbi`)

Helper hooks for reads are in:

- `src/lib/hooks/useUserContract.js` (exports: `useMyUserDetails`, `useMyDataArray`, `useAllUsers`, `useUserDetails`, `useUserDataArray`)

### Registering a user (Login page)

- File: `src/pages/Login.jsx`
- **Wallet Connection**: Uses `useAppKit()` hook to open Reown AppKit modal for wallet connection
- **Flow**: 
  1. User enters a username
  2. If wallet not connected, Reown AppKit modal opens automatically via `open()` function
  3. User connects wallet through WalletConnect or other supported providers
  4. Once connected, `useAppKitAccount()` provides connection status
  5. App calls `registerUser(username)` using `wagmi` `useWriteContract` with `userDataAbi`
  6. Transaction is signed in the user's wallet
  7. On transaction confirmation, navigate to `/:username`
- **Auto-redirect**: If user already has a profile, they're automatically redirected to dashboard

### Reading connected user data

Example usage in a component:

```jsx
import { useMyUserDetails, useMyDataArray } from "../lib/hooks/useUserContract";

const { data: details } = useMyUserDetails();
const { data: dataArray } = useMyDataArray();
```

### Adding user data (example)

```jsx
import { useWriteContract } from "wagmi";
import { userDataAbi } from "../lib/abi/userDataContract";

const { writeContract } = useWriteContract();
writeContract({
  abi: userDataAbi,
  address: import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS,
  functionName: "addUserData",
  args: ["twitter", "https://twitter.com/you"],
});
```

## Project Structure

```
src/
  main.jsx          # App bootstrap with AppKitProvider
  App.jsx           # Routes configuration
  Provider.jsx      # Reown AppKit provider setup & wagmi configuration
  pages/
    Home.jsx        # Landing page with hero section
    UserProfile.jsx # Username route (public profile) - uses useAppKitAccount
    Login.jsx      # Register username on-chain - uses useAppKit() for wallet connection
    Dashboard.jsx   # Profile management dashboard
    Discover.jsx    # Browse all registered users
    AdminDashboard.jsx # Analytics and user tracking dashboard
  lib/
    abi/
      userDataContract.js   # Contract ABI
    hooks/
      useUserContract.js    # Read helpers (uses wagmi hooks)
    utils/
      explorer.js           # Blockchain explorer URLs
      analytics.js          # Analytics tracking utility
  index.css         # Tailwind import
```

### Reown AppKit Integration Points

- **Provider.jsx**: Initializes Reown AppKit with wagmi adapter and network configuration
- **Login.jsx**: Uses `useAppKit()` to open wallet connection modal
- **UserProfile.jsx**: Uses `useAppKitAccount()` to check if user owns the profile
- **All pages**: Can access wallet connection state via `useAppKitAccount()` hook

### Discover Feature

- **Discover Page** (`/discover`): Browse all registered users on the platform
- Shows all profiles registered on-chain
- Click any profile card to view their public profile
- Uses `getAllUsers()` contract function to fetch all registered addresses
- Each card displays username and truncated wallet address

### Dashboard Feature

- **Dashboard** (`/dashboard`): Manage your onchain profile
- View profile overview with stats
- Add/edit links with expandable form
- Quick stats: total links, join date, network
- Link to view your public profile

### Admin Dashboard

- **Admin Dashboard** (`/admin`): Comprehensive analytics and user interaction tracking
- Real-time metrics: Total users, profile views, link clicks, registrations
- **Interactive ApexCharts visualizations:**
  - Hourly activity area chart (last 24 hours)
  - Daily trends line chart (last 7 days)
  - Event distribution pie chart
  - User growth over time area chart
  - Most active users horizontal bar chart (top 10)
- Top clicked links leaderboard
- Recent activity feed (last 24 hours)
- User engagement metrics including click-through rate
- Auto-refreshing data every 5 seconds
- Analytics tracking for:
  - Profile views
  - Link clicks
  - User registrations
  - Link additions

## Key Dependencies

### Web3 & Wallet Connection

- **@reown/appkit**: Modern wallet connection SDK providing unified wallet interface (formerly WalletConnect)
  - Supports 100+ wallet providers including MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, etc.
  - Mobile wallet support via QR code scanning
  - Beautiful, customizable connection modal
  - Built-in network switching
  
- **@reown/appkit-adapter-wagmi**: Wagmi adapter for seamless Reown AppKit integration
  - Bridges Reown AppKit with wagmi hooks
  - Enables wallet connection state management
  - Provides hooks: `useAppKit()`, `useAppKitAccount()`, `useDisconnect()`

- **wagmi**: React hooks for Ethereum interactions
  - `useWriteContract`: Write transactions to smart contracts
  - `useReadContract`: Read data from smart contracts
  - `useWaitForTransactionReceipt`: Track transaction status
  - `useChainId`: Get current network chain ID

- **viem**: TypeScript interface and utilities for Ethereum
  - Type-safe contract interactions
  - Transaction building and signing
  - ABI encoding/decoding

### UI & Data

- **@tanstack/react-query**: Data fetching and state management for React
  - Caching and background updates
  - Automatic refetching
  - Optimistic updates

- **react-router-dom**: Client-side routing
  - Dynamic routes (`/:username`)
  - Navigation between pages

- **tailwindcss**: Utility-first CSS framework
  - Rapid UI development
  - Responsive design utilities

- **react-hot-toast**: Beautiful toast notifications
  - Transaction status updates
  - Success/error notifications

- **apexcharts** + **react-apexcharts**: Interactive chart library for data visualization
  - Analytics dashboards
  - Real-time data visualization

### Network Configuration

Additional networks can be easily added by importing them from `@reown/appkit/networks`. The app currently supports:
- Base Sepolia (Testnet)
- Base Mainnet
- Ethereum Mainnet (fallback)

To add more networks, update `src/Provider.jsx`:

```jsx
import { baseSepolia, base } from '@reown/appkit/networks'

// Add networks to the configuration
```

## License

MIT
