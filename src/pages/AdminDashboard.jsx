import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAllUsers } from "../lib/hooks/useUserContract";
import Analytics from "../lib/utils/analytics";

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: allUsers } = useAllUsers();
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      setStats(Analytics.getStats());
    };
    updateStats();
    const interval = setInterval(updateStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshKey]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getEventIcon = (event) => {
    switch (event) {
      case "profile_view":
        return "👁️";
      case "link_click":
        return "🔗";
      case "user_registered":
        return "✨";
      case "link_added":
        return "➕";
      default:
        return "📊";
    }
  };

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Track user interactions and platform analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                🔄 Refresh
              </button>
              <Link
                to="/"
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-3xl font-bold text-neutral-900">
              {allUsers?.length || 0}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Total Users</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalProfileViews}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Profile Views</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalLinkClicks}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Link Clicks</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalUserRegistrations}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Registrations</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="text-3xl font-bold text-orange-600">
              {stats.totalLinkAdditions}
            </div>
            <div className="mt-1 text-sm text-neutral-500">Links Added</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Links */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">
              Top Clicked Links
            </h2>
            {stats.topLinks.length > 0 ? (
              <div className="space-y-3">
                {stats.topLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">
                          @{link.username}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {link.linkKey}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {link.count} clicks
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400">
                No link clicks yet
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">
              Recent Activity (Last 24h)
            </h2>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="text-2xl">
                      {getEventIcon(activity.event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-neutral-900 capitalize">
                        {activity.event.replace(/_/g, " ")}
                      </div>
                      <div className="mt-1 text-sm text-neutral-500">
                        {activity.data.username && `@${activity.data.username}`}
                        {activity.data.linkKey && ` • ${activity.data.linkKey}`}
                      </div>
                      <div className="mt-1 text-xs text-neutral-400">
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* User Engagement */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">
            User Engagement
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
              <div className="text-2xl font-bold text-neutral-900">
                {stats.uniqueViewers}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                Unique Profile Viewers
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalEvents}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                Total Events Tracked
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalLinkClicks > 0 && stats.totalProfileViews > 0
                  ? (
                      (stats.totalLinkClicks / stats.totalProfileViews) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                Click-Through Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

