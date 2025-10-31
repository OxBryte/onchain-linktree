import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const chainId = useChainId();

  // On-chain reads
  const { data: details, isLoading: detailsLoading } = useMyUserDetails();
  const { data: dataArray, isLoading: dataLoading, refetch } = useMyDataArray();

  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;
  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Show toast when transaction hash is received
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
      refetch?.();
      setValueInput("");
      setKeyInput("");
      setShowAddForm(false);
    }
  }, [isConfirmed, hash, chainId, refetch]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/login");
    }
  }, [isConnected, navigate]);

  const onAdd = () => {
    if (!keyInput.trim() || !valueInput.trim()) return;
    writeContract({
      abi: userDataAbi,
      address: contractAddress,
      functionName: "addUserData",
      args: [keyInput.trim(), valueInput.trim()],
    });
  };

  const links = (dataArray || []).map((item) => ({
    title: item.key,
    url: item.value,
  }));

  if (!isConnected || detailsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    );
  }

  if (!details?.exists) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            No Profile Found
          </h2>
          <p className="text-neutral-600 mb-6">
            You need to register a username first
          </p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl bg-neutral-900 px-6 py-3 font-semibold text-white"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Manage your onchain profile
              </p>
            </div>
            <Link
              to={`/${details.username}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Profile Overview Card */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-4xl shadow-xl">
                👤
              </div>
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">
                  {details.username}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Verified onchain
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900">
                {links.length}
              </div>
              <div className="text-xs text-neutral-500">Total Links</div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">Your Links</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.98]"
            >
              {showAddForm ? "Cancel" : "+ Add Link"}
            </button>
          </div>

          {/* Add Link Form */}
          {showAddForm && (
            <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  placeholder="Label (e.g. Twitter)"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  disabled={isPending || isConfirming}
                />
                <input
                  placeholder="URL (https://...)"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
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

          {/* Links List */}
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-lg">
                      🔗
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {link.title}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        {link.url.length > 50
                          ? `${link.url.slice(0, 50)}...`
                          : link.url}
                      </a>
                    </div>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-neutral-500">No links yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Add your first link to get started
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-neutral-900">
              {links.length}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Active Links</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-neutral-900">
              {details.createdAt
                ? new Date(
                    Number(details.createdAt) * 1000
                  ).toLocaleDateString()
                : "—"}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Joined</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-2xl font-bold text-neutral-900">Base</div>
            <div className="mt-1 text-sm text-neutral-500">Network</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
