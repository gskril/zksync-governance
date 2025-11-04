export const env = {
  PONDER_URL: process.env.NEXT_PUBLIC_PONDER_URL!,
  ZKSYNC_RPC_URL: process.env.NEXT_PUBLIC_ZKSYNC_RPC_URL!,
  ETH_RPC_URL: process.env.NEXT_PUBLIC_ETH_RPC_URL!,
  WALLETCONNECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
}

// Get all keys
const keys = Object.keys(env)

// Make sure all keys are defined
for (const key of keys) {
  if (!env[key as keyof typeof env]) {
    throw new Error(`Missing ${key} in environment variables`)
  }
}
