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

  return (
    <div className="min-h-[100vh] w-full bg-white">
      {/* User Address Finder Component */}
      {!isOwnProfile && allUsers && allUsers.length > 0 && !targetAddress && (
        <UserAddressFinder
          allUsers={allUsers}
          targetUsername={username}
          onAddressFound={setTargetAddress}
          onSearchComplete={() => setSearchingAddress(false)}
        />
      )}

      {/* Elegant Header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Profile Section */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-6xl shadow-2xl ring-4 ring-neutral-100">
            👤
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900">
            {displayName}
          </h1>
          <p className="text-lg text-neutral-500">@{username}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            Verified onchain
          </div>
        </div>

        {/* Links Section */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"></div>
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => Analytics.trackLinkClick(username, link.title, link.url)}
                  className="group flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-white px-6 py-4 text-left transition-all hover:border-neutral-900 hover:shadow-lg hover:shadow-neutral-900/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      🔗
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-neutral-900">
                        {link.title}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500 max-w-[200px] sm:max-w-none">
                        {link.url.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900">
                    →
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
              <div className="mb-3 text-4xl">🔗</div>
              <p className="text-neutral-500">No links yet</p>
            </div>
          )}
        </div>

        {/* Add Link Form - Only show if viewing own profile */}
        {isOwnProfile && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">
              Add New Link
            </h3>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Label (e.g. Twitter)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                disabled={isPending || isConfirming}
              />
              <input
                type="url"
                placeholder="https://..."
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                disabled={isPending || isConfirming}
              />
            </div>
            <button
              onClick={onAdd}
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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
              <p className="mt-3 text-center text-xs text-red-600">
                {error.message}
              </p>
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