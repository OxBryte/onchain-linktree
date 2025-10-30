import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppKit, useDisconnect } from "@reown/appkit/react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { userDataAbi } from "../lib/abi/userDataContract";
import { useAppKitAccount } from "@reown/appkit/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const { open } = useAppKit();
    const { isConnected, address } = useAppKitAccount();
    const { disconnect } = useDisconnect();

  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;

  // ABI moved to src/lib/abi/userDataContract

  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && username.trim()) {
      navigate(`/${username.trim()}`);
    }
  }, [isConfirmed, navigate, username]);

  const onContinue = () => {
    const value = username.trim();
    if (!value) return;
    if (!isConnected) {
      open();
      return;
    }
    if (!contractAddress) {
      alert(
        "Contract address not configured (VITE_USER_DATA_CONTRACT_ADDRESS)"
      );
      return;
    }
    writeContract({
      abi: userDataAbi,
      address: contractAddress,
      functionName: "registerUser",
      args: [value],
    });
  };

  return (
    <div className="min-h-[100vh] w-full bg-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your username to continue
          </p>
        </div>
        <div className="flex gap-2 flex-col">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-800 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-300"
          />
          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
          >
            {isPending || isConfirming ? "Processing..." : "Connect Wallet"}
          </button>
          {isConnected && (
            <>
              <p className="text-sm text-neutral-500">
                Connected to {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <button
                onClick={disconnect}
                className="w-full rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
              >
                Disconnect
              </button>
            </>
          )}
          {writeError && (
            <p className="text-sm text-red-500">{writeError.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
