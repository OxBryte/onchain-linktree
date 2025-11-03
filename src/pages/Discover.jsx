import { useNavigate, Link } from "react-router-dom";
import { useAllUsers, useUserDetails } from "../lib/hooks/useUserContract";

function Discover() {
  const navigate = useNavigate();
  const { data: allUsers, isLoading } = useAllUsers();

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Discover</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Explore all registered profiles
              </p>
            </div>
            <Link
              to="/"
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
          </div>
        ) : !allUsers || allUsers.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              No users found
            </h2>
            <p className="text-neutral-500">
              Be the first to register and create your profile!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                {allUsers.length} {allUsers.length === 1 ? "profile" : "profiles"} registered
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allUsers.map((address, index) => (
                <UserCard key={address} address={address} />
              ))}
            </div>
          </>
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
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200"></div>
          <div className="flex-1">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-neutral-200"></div>
            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200"></div>
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
      className="cursor-pointer rounded-xl bg-white p-6 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-2xl shadow-md">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {userDetails.username}
          </h3>
          <p className="mt-1 truncate text-xs text-neutral-500">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <div className="text-neutral-400">→</div>
      </div>
    </div>
  );
}

export default Discover;

