import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { base, baseSepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://dashboard.reown.com
const projectId = import.meta.env.VITE_APPKIT_PROJECT_ID || "";

if (!projectId) {
  throw new Error("VITE_APPKIT_PROJECT_ID is not set");
}
// 2. Create a metadata object - optional
const metadata = {
  name: "Onchain Linktree",
  description: "Decentralized Link Hub",
  url: "https://onchain-linktree.com", // origin must match your domain & subdomain
  icons: ["/logo.png"],
};

// 3. Set the networks
const networks = [base];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
