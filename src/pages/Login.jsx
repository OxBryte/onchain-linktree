import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppKit, useDisconnect } from "@reown/appkit/react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import toast from "react-hot-toast";
import { userDataAbi } from "../lib/abi/userDataContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useMyUserDetails } from "../lib/hooks/useUserContract";
import { getExplorerUrl } from "../lib/utils/explorer";
import Analytics from "../lib/utils/analytics";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;
  const chainId = useChainId();

  // Check if user already has a profile
  const { data: userDetails, isLoading: detailsLoading } = useMyUserDetails();

  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Show toast when transaction hash is received (user signed)
  useEffect(() => {
    if (hash) {
      const explorerUrl = getExplorerUrl(chainId, hash);
      toast.success(
        <div>
          <div className="font-semibold">Transaction Submitted</div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </a>
        </div>,
        { duration: 5000 }
      );
    }
  }, [hash, chainId]);

  // Show toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      const explorerUrl = getExplorerUrl(chainId, hash);
      toast.success(
        <div>
          <div className="font-semibold">Transaction Confirmed!</div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            View on explorer
          </a>
        </div>,
        { duration: 6000 }
      );
    }
  }, [isConfirmed, hash, chainId]);

  // Redirect to profile if user already exists
  useEffect(() => {
    if (
      isConnected &&
      !detailsLoading &&
      userDetails?.exists &&
      userDetails?.username &&
      userDetails.username.trim().length > 0
    ) {
      navigate("/dashboard");
    }
  }, [isConnected, detailsLoading, userDetails, navigate]);

  // Redirect after successful registration
  useEffect(() => {
    if (isConfirmed && username.trim()) {
      Analytics.trackUserRegistration(username.trim(), address || "");
      navigate("/dashboard");
    }
  }, [isConfirmed, navigate, username, address]);

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
    <div className="min-h-[100vh] w-full bg-neutral-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Create Your Profile
          </h1>
          <p className="text-neutral-600">
            Connect your wallet and choose a username
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          {/* Loading state while checking profile */}
          {isConnected && detailsLoading && (
            <div className="mb-6 flex items-center justify-center gap-2 text-neutral-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
              <span className="text-sm">Checking profile...</span>
            </div>
          )}

          {/* Wallet Connection Section */}
          {!isConnected ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Step 1: Connect Wallet
              </label>
              <button
                onClick={() => open()}
                className="w-full rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98]"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-sm font-medium text-emerald-700">
                    Wallet Connected
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Disconnect
                </button>
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}

          {/* Username Section */}
          <div className={isConnected ? "" : "opacity-50 pointer-events-none"}>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              {isConnected
                ? "Step 2: Choose Username"
                : "Step 2: Choose Username (connect wallet first)"}
            </label>
            <input
              type="text"
              placeholder="e.g. alice"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && isConnected && onContinue()
              }
              disabled={!isConnected || isPending || isConfirming}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Register Button */}
          {isConnected && (
            <button
              onClick={onContinue}
              disabled={!username.trim() || isPending || isConfirming}
              className="mt-4 w-full rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-900"
            >
              {isPending || isConfirming
                ? "Registering on-chain..."
                : "Register & Continue"}
            </button>
          )}

          {/* Error Message */}
          {writeError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{writeError.message}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {(isPending || isConfirming) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
              <span>Processing transaction...</span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Your profile will be stored permanently on the blockchain
        </p>
      </div>
    </div>
  );
}
