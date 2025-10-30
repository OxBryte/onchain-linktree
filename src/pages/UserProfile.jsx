import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { userDataAbi } from "../lib/abi/userDataContract";
import { useMyUserDetails, useMyDataArray } from "../lib/hooks/useUserContract";

function UserProfile() {
  const { username } = useParams();
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  // On-chain reads for the connected wallet
  const { data: details, isLoading: detailsLoading } = useMyUserDetails();
  console.log(details);
  console.log(detailsLoading);
  const { data: dataArray, isLoading: dataLoading, refetch } = useMyDataArray();
  console.log(dataArray);
  console.log(dataLoading);

  const [keyInput, setKeyInput] = useState("twitter");
  const [valueInput, setValueInput] = useState("");

  const contractAddress = import.meta.env.VITE_USER_DATA_CONTRACT_ADDRESS;
  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetch?.();
      setValueInput("");
    }
  }, [isConfirmed, refetch]);

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
    <div className="min-h-[100vh] w-full bg-neutral-100 px-6 py-10">
      <div className="mx-auto mb-8 max-w-xl">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <span className="mr-1">←</span> Back
        </Link>
      </div>

      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-[0_24px_48px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-4xl">
            👤
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">@{username}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
            {detailsLoading
              ? "Loading on-chain details..."
              : "Decentralized profile on the blockchain"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
            <span>🔐</span>
            Verified onchain
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {(!dataLoading ? links : []).map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-800 transition-colors hover:bg-white hover:shadow-sm"
            >
              <span className="flex items-center gap-3 text-sm">
                <span className="text-base">🔗</span>
                {link.title}
              </span>
              <span className="text-neutral-400 group-hover:text-neutral-600">
                →
              </span>
            </a>
          ))}
          {!dataLoading && links.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
              No links yet. Add one below.
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-2 text-sm font-medium text-neutral-800">
            Add link
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              placeholder="key (e.g. twitter)"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300"
            />
            <input
              placeholder="value (https://...)"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300"
            />
            <button
              onClick={onAdd}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Saving..." : "Save"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500">{error.message}</p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-neutral-500">
          <span>Stored on-chain</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Base Sepolia
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
