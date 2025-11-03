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
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header with icon */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-4xl shadow-2xl">
            🔗
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
            Create Your Profile
          </h1>
          <p className="text-lg text-neutral-600">
            Connect your wallet and claim your onchain identity
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-neutral-100">
          {/* Loading state while checking profile */}
          {isConnected && detailsLoading && (
            <div className="mb-8 flex items-center justify-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
              <span className="text-sm font-medium text-blue-700">
                Checking profile...
              </span>
            </div>
          )}

          {/* Wallet Connection Section */}
          {!isConnected ? (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold text-neutral-600">
                  1
                </div>
                <label className="text-base font-semibold text-neutral-900">
                  Connect Your Wallet
                </label>
              </div>
              <p className="mb-4 text-sm text-neutral-500">
                Start by connecting your crypto wallet to continue
              </p>
              <button
                onClick={() => open()}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-xl">🔐</span>
                  <span>Connect Wallet</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-900">
                      Wallet Connected
                    </div>
                    <div className="text-xs font-mono text-emerald-700">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-white/80"
                >
                  Disconnect
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Ready to create your profile</span>
              </div>
            </div>
          )}

          {/* Username Section */}
          <div className={isConnected ? "" : "opacity-40 pointer-events-none"}>
            <div className="mb-4 flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  isConnected
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-400"
                }`}
              >
                2
              </div>
              <label className="text-base font-semibold text-neutral-900">
                Choose Your Username
              </label>
            </div>
            <p className="mb-4 text-sm text-neutral-500">
              This will be your unique onchain identity
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && isConnected && onContinue()
                }
                disabled={!isConnected || isPending || isConfirming}
                className="w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-5 py-4 text-base text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/10 disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {username.trim() && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Register Button */}
          {isConnected && (
            <button
              onClick={onContinue}
              disabled={!username.trim() || isPending || isConfirming}
              className="mt-6 group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending || isConfirming ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>Registering on-chain...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Create Profile & Continue</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
          )}

          {/* Error Message */}
          {writeError && (
            <div className="mt-6 rounded-2xl bg-red-50 border-2 border-red-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700">
                  {writeError.message}
                </p>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {(isPending || isConfirming) && !writeError && (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
              <span className="text-sm font-medium text-blue-700">
                Processing transaction on blockchain...
              </span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2">
            <svg
              className="h-4 w-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs font-medium text-neutral-600">
              Your profile will be stored permanently on the blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
