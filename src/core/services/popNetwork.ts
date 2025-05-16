import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/web"
import { createInkSdk } from "@polkadot-api/sdk-ink"
import { pop } from "@polkadot-api/descriptors"

// Pop Network testnet configuration
export const POP_NETWORK_CONFIG = {
  // Pop Network testnet WebSocket endpoint
  WS_ENDPOINT: process.env.NEXT_PUBLIC_POP_NETWORK_RPC || "wss://rpc2.paseo.popnetwork.xyz",
  
  // Smart contract addresses
  CONTRACTS: {
    CERTIFICATE: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS || "",
    PROCTORINK: process.env.NEXT_PUBLIC_PROCTORINK_CONTRACT_ADDRESS || ""
  }
}

// Create a WebSocket provider for Pop Network
export function createPopNetworkClient() {
  // Use getWsProvider for browser environment
  const provider = getWsProvider(POP_NETWORK_CONFIG.WS_ENDPOINT)
  
  return createClient(provider)
}

// Initialize the client
let client: ReturnType<typeof createClient> | null = null

export async function getPopNetworkClient() {
  if (!client) {
    client = createPopNetworkClient()
  }
  return client
}

// Function to interact with ink! smart contracts
export async function initializeContractSDK(contractMetadata: any) {
  const client = await getPopNetworkClient()
  
  // Use the typed API for Pop Network
  const api = client.getTypedApi(pop)
  
  return createInkSdk(api, contractMetadata)
}