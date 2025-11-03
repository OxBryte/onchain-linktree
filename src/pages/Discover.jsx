import { useNavigate, Link } from "react-router-dom";
import { useAllUsers, useUserDetails } from "../lib/hooks/useUserContract";

function Discover() {
  const navigate = useNavigate();
  const { data: allUsers, isLoading } = useAllUsers();

  return (
    <div className="min-h-[100vh] w-full bg-neutral-50">
      {/* Minimal Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Discover</h1>
              <p className="mt-0.5 text-xs text-neutral-500">
                Browse all registered profiles
              </p>
            </div>
            <Link
              to="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats Bar */}
        {!isLoading && allUsers && allUsers.length > 0 && (
          <div className="mb-8 flex items-center gap-6">
            <div className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">{allUsers.length}</span>{" "}
              {allUsers.length === 1 ? "profile" : "profiles"}
            </div>
            <div className="h-4 w-px bg-neutral-300"></div>
            <div className="text-xs text-neutral-500">
              Click any profile to view
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
          </div>
        ) : !allUsers || allUsers.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-16 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              No profiles yet
            </h2>
            <p className="text-sm text-neutral-500">
              Be the first to register and create your profile
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allUsers.map((address) => (
              <UserCard key={address} address={address} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ address }) {
  const { data: userDetails, isLoading } = useUserDetails(address);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200"></div>
          <div className="flex-1">
            <div className="mb-1.5 h-4 w-20 animate-pulse rounded bg-neutral-200"></div>
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails?.exists || !userDetails?.username) {
    return null;
  }

  return (
    <div
      onClick={() => navigate(`/${userDetails.username}`)}
      className="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg">
          👤
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-neutral-900 group-hover:text-neutral-700">
            {userDetails.username}
          </div>
          <div className="mt-0.5 truncate text-xs text-neutral-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        <div className="flex-shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-400">
          →
        </div>
      </div>
    </div>
  );
}

export default Discover;

