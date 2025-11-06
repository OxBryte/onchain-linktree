import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useReadContract,
} from "wagmi";
import toast from "react-hot-toast";
import { useAppKit } from "@reown/appkit/react";
import { userDataAbi } from "../lib/abi/userDataContract";
import {
  useMyUserDetails,
  useMyDataArray,
  useAllUsers,
  useUserDataArray,
} from "../lib/hooks/useUserContract";
import { getExplorerUrl } from "../lib/utils/explorer";
import Analytics from "../lib/utils/analytics";

function UserProfile() {
  const { username } = useParams();
  const { isConnected, address: connectedAddress } = useAccount();
  const { open } = useAppKit();

  // Get all users to find address by username
  const { data: allUsers } = useAllUsers();
  const { data: myDetails } = useMyUserDetails();

  // Check if viewing own profile
  const isOwnProfile =
    isConnected &&
    myDetails?.username?.toLowerCase() === username?.toLowerCase();

  // Find user address by checking each user's details
  const [targetAddress, setTargetAddress] = useState(null);
  const [searchingAddress, setSearchingAddress] = useState(false);

  useEffect(() => {
    if (isOwnProfile) {
      setTargetAddress(connectedAddress);
      setSearchingAddress(false);
      return;
    }

    // Search through all users to find matching username
    if (allUsers && allUsers.length > 0 && !targetAddress) {
      setSearchingAddress(true);
      // We'll check users one by one - but this is inefficient
      // Better approach: use a component that checks each user
    } else if (!allUsers || allUsers.length === 0) {
      setSearchingAddress(false);
    }
  }, [isOwnProfile, allUsers, connectedAddress, username, myDetails, targetAddress]);

  // Use appropriate hooks based on profile ownership
  const { data: myDataArray, isLoading: myDataLoading, refetch } = useMyDataArray();
  const { data: userDataArray, isLoading: userDataLoading } = useUserDataArray(targetAddress);

  // Use appropriate data source
  const dataArray = isOwnProfile ? myDataArray : userDataArray;
  const isLoading = isOwnProfile ? myDataLoading : userDataLoading || searchingAddress;

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
    myDetails?.username && myDetails.username.toLowerCase() === username.toLowerCase()
      ? myDetails.username
      : username;
  const links = (dataArray || []).map((item) => ({
    title: item.key,
    url: item.value,
  }));

  // Helper function to get icon based on link type
  const getLinkIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("twitter") || lower.includes("x.com")) return "𝕏";
    if (lower.includes("github")) return "💻";
    if (lower.includes("linkedin")) return "💼";
    if (lower.includes("instagram")) return "📷";
    if (lower.includes("youtube")) return "▶️";
    if (lower.includes("discord")) return "💬";
    if (lower.includes("telegram")) return "✈️";
    if (lower.includes("website") || lower.includes("web")) return "🌐";
    return "🔗";
  };

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* User Address Finder Component */}
      {!isOwnProfile && allUsers && allUsers.length > 0 && !targetAddress && (
        <UserAddressFinder
          allUsers={allUsers}
          targetUsername={username}
          onAddressFound={setTargetAddress}
          onSearchComplete={() => setSearchingAddress(false)}
        />
      )}

      {/* Minimal Header */}
      <div className="border-b border-neutral-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Enhanced Profile Header */}
        <div className="mb-12 text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 blur-2xl opacity-30"></div>
            <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-6xl shadow-2xl ring-4 ring-white">
              👤
            </div>
            {isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white text-white text-xs font-bold shadow-lg">
                ✓
              </div>
            )}
          </div>
          <h1 className="mb-2 text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            {displayName}
          </h1>
          <p className="mb-4 text-xl text-neutral-500 font-medium">@{username}</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Verified onchain</span>
          </div>
          {links.length > 0 && (
            <p className="mt-4 text-sm text-neutral-400">
              {links.length} {links.length === 1 ? "link" : "links"}
            </p>
          )}
        </div>

        {/* Enhanced Links Section */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"></div>
              <p className="text-sm font-medium text-neutral-500">Loading profile...</p>
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-4">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => Analytics.trackLinkClick(username, link.title, link.url)}
                  className="group relative flex items-center gap-5 rounded-2xl border-2 border-neutral-200/50 bg-white/80 backdrop-blur-sm px-6 py-5 text-left transition-all duration-300 hover:border-neutral-900 hover:bg-white hover:shadow-xl hover:shadow-neutral-900/10 hover:-translate-y-1"
                >
                  {/* Icon Container */}
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-neutral-900 group-hover:to-neutral-800 group-hover:shadow-lg">
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {getLinkIcon(link.title)}
                    </span>
                  </div>
                  
                  {/* Link Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 font-bold text-lg text-neutral-900 transition-colors group-hover:text-neutral-900">
                      {link.title}
                    </div>
                    <div className="truncate text-sm text-neutral-500 group-hover:text-neutral-600">
                      {link.url.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex-shrink-0 text-neutral-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-neutral-900">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neutral-900/0 to-neutral-900/0 transition-opacity duration-300 group-hover:from-neutral-900/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-white px-8 py-20 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-4xl">
                🔗
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-700">
                No links yet
              </h3>
              <p className="text-sm text-neutral-500">
                {isOwnProfile
                  ? "Add your first link to get started"
                  : "This user hasn't added any links yet"}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Add Link Form - Only show if viewing own profile */}
        {isOwnProfile && (
          <div className="rounded-2xl border border-neutral-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-lg">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Add New Link</h3>
                <p className="text-xs text-neutral-500">Create a new onchain link</p>
              </div>
            </div>
            
            <div className="mb-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Twitter, GitHub, Website"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                  disabled={isPending || isConfirming}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/10 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                  disabled={isPending || isConfirming}
                />
              </div>
            </div>
            
            <button
              onClick={onAdd}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={
                !keyInput.trim() ||
                !valueInput.trim() ||
                isPending ||
                isConfirming
              }
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending || isConfirming ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>Saving on-chain...</span>
                  </>
                ) : (
                  <>
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
                    <span>Add Link</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
            
            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 border-2 border-red-200 p-4">
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
                <p className="text-sm font-medium text-red-700">{error.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Component to find user address by username
function UserAddressFinder({ allUsers, targetUsername, onAddressFound, onSearchComplete }) {
  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAddress = allUsers[currentIndex];

  const { data: userDetails } = useReadContract({
    abi: userDataAbi,
    address: contractAddress,
    functionName: "getUserDetails",
    args: currentAddress ? [currentAddress] : undefined,
    query: { enabled: Boolean(currentAddress) },
  });

  useEffect(() => {
    if (userDetails?.exists && userDetails?.username) {
      if (userDetails.username.toLowerCase() === targetUsername.toLowerCase()) {
        onAddressFound(currentAddress);
        onSearchComplete();
        return;
      }
    }

    // Move to next user
    if (currentIndex < allUsers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Searched all users, didn't find match
      onSearchComplete();
    }
  }, [userDetails, currentIndex, allUsers.length, targetUsername, currentAddress, onAddressFound, onSearchComplete]);

  return null; // This component doesn't render anything
}

export default UserProfile;