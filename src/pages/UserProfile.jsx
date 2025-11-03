import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import toast from "react-hot-toast";
import { useAppKit } from "@reown/appkit/react";
import { userDataAbi } from "../lib/abi/userDataContract";
import { useMyUserDetails, useMyDataArray } from "../lib/hooks/useUserContract";
import { getExplorerUrl } from "../lib/utils/explorer";
import Analytics from "../lib/utils/analytics";

function UserProfile() {
  const { username } = useParams();
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  // On-chain reads for the connected wallet
  const { data: details, isLoading: detailsLoading } = useMyUserDetails();
  const { data: dataArray, isLoading: dataLoading, refetch } = useMyDataArray();

  const [keyInput, setKeyInput] = useState("twitter");
  const [valueInput, setValueInput] = useState("");

  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;
  const chainId = useChainId();
  const { data: hash, isPending, writeContract, error } = useWriteContract();
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
          <div className="font-semibold">Link Added Successfully!</div>
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

  useEffect(() => {
    if (isConfirmed) {
      refetch?.();
      setValueInput("");
      Analytics.trackLinkAdded(username, keyInput.trim());
    }
  }, [isConfirmed, refetch, username, keyInput]);

  // Track profile view
  useEffect(() => {
    Analytics.trackProfileView(username);
  }, [username]);

  const onAdd = () => {
    if (!isConnected) {
      open();
      return;
    }
    if (!keyInput.trim() || !valueInput.trim()) return;
    writeContract({
      abi: userDataAbi,
      address: contractAddress,
      functionName: "addUserData",
      args: [keyInput.trim(), valueInput.trim()],
    });
  };

  const displayName =
    details?.username && details.username.length > 0
      ? details.username
      : username;
  const links = (dataArray || []).map((item) => ({
    title: item.key,
    url: item.value,
  }));

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Minimal Back Button */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <span>←</span> <span>Back</span>
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Profile Header - Bold & Eye-catching */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-5xl shadow-xl">
              👤
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
              {displayName}
            </h1>
            <p className="mt-2 text-base text-neutral-500">@{username}</p>
          </div>

          {/* Links - Large & Prominent */}
          <div className="mb-8 space-y-4">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
              </div>
            ) : links.length > 0 ? (
              links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => Analytics.trackLinkClick(username, link.title, link.url)}
                  className="group block rounded-2xl bg-white px-6 py-4 text-center font-semibold text-neutral-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  {link.title}
                </a>
              ))
            ) : (
              <div className="rounded-2xl bg-white px-6 py-12 text-center text-neutral-400 shadow-lg">
                No links yet
              </div>
            )}
          </div>

          {/* Add Link Form - Subtle but Accessible */}
          {isConnected && (
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  placeholder="Label"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-neutral-400 focus:bg-white"
                  disabled={isPending || isConfirming}
                />
                <input
                  placeholder="URL"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-neutral-400 focus:bg-white"
                  disabled={isPending || isConfirming}
                />
              </div>
              <button
                onClick={onAdd}
                className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
                disabled={
                  !keyInput.trim() ||
                  !valueInput.trim() ||
                  isPending ||
                  isConfirming
                }
              >
                {isPending || isConfirming ? "Saving..." : "Add Link"}
              </button>
              {error && (
                <p className="mt-2 text-center text-xs text-red-500">
                  {error.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
