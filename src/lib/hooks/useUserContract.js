import { useReadContract } from "wagmi";
import { userDataAbi } from "../abi/userDataContract";

const CONTRACT_ADDRESS = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;

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
