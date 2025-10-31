// Get blockchain explorer URL for transaction hash
export function getExplorerUrl(chainId, txHash) {
  // Base Sepolia chainId is 84532
  if (chainId === 84532 || chainId === 8453) {
    // Base Mainnet chainId is 8453
    return `https://basescan.org/tx/${txHash}`;
  }
  // Default to Base Sepolia if chainId not recognized
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
