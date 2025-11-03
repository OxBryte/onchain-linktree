import { useReadContract } from "wagmi";
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
    account: address,
    query: { enabled: canRead },
  });

  return result;
}

export function useMyDataArray() {
  const { address, isConnected } = useAppKitAccount();
  const canRead = Boolean(CONTRACT_ADDRESS) && isConnected;

  const result = useReadContract({
    abi: userDataAbi,
    address: CONTRACT_ADDRESS,
    functionName: "getMyDataArray",
    account: address,
    query: { enabled: canRead },
  });

  return result;
}

export function useAllUsers() {
  const result = useReadContract({
    abi: userDataAbi,
    address: CONTRACT_ADDRESS,
    functionName: "getAllUsers",
    query: { enabled: Boolean(CONTRACT_ADDRESS) },
  });

  return result;
}

export function useUserDetails(address) {
  const result = useReadContract({
    abi: userDataAbi,
    address: CONTRACT_ADDRESS,
    functionName: "getUserDetails",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(CONTRACT_ADDRESS) && Boolean(address) },
  });

  return result;
}
