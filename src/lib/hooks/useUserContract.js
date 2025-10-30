import { useAccount, useReadContract } from "wagmi";
import { userDataAbi } from "../abi/userDataContract";
import { useAppKitAccount } from "@reown/appkit/react";

const CONTRACT_ADDRESS = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;

export function useMyUserDetails() {
  const { address, isConnected } = useAppKitAccount();
  const canRead = Boolean(CONTRACT_ADDRESS) && isConnected;

  const result = useReadContract({
    abi: userDataAbi,
    address: CONTRACT_ADDRESS,
    functionName: "getMyDetails",
    query: { enabled: canRead },
  });

  return result;
}

export function useMyDataArray() {
  const { isConnected } = useAccount();
  const canRead = Boolean(CONTRACT_ADDRESS) && isConnected;

  const result = useReadContract({
    abi: userDataAbi,
    address: CONTRACT_ADDRESS,
    functionName: "getMyDataArray",
    query: { enabled: canRead },
  });

  return result;
}
