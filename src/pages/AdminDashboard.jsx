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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  const getEventColor = (event) => {
    switch (event) {
      case "profile_view":
        return "bg-blue-100 text-blue-700";
      case "link_click":
        return "bg-green-100 text-green-700";
      case "user_registered":
        return "bg-purple-100 text-purple-700";
      case "link_added":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  // Calculate hourly chart data
  const getHourlyChartData = () => {
    if (!stats?.hourlyBreakdown) return [];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => ({
      hour: hour.toString().padStart(2, "0") + ":00",
      count: stats.hourlyBreakdown[hour] || 0,
    }));
  };

  // Calculate daily chart data
  const getDailyChartData = () => {
    if (!stats?.dailyBreakdown) return [];
    const entries = Object.entries(stats.dailyBreakdown);
    return entries
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({
        date: formatDate(date),
        count,
      }));
  };

  // Calculate CTR
  const ctr =
    stats?.totalProfileViews > 0 && stats?.totalLinkClicks > 0
      ? ((stats.totalLinkClicks / stats.totalProfileViews) * 100).toFixed(1)
      : "0.0";

  // Calculate engagement rate
  const engagementRate =
    stats?.totalUserRegistrations > 0 && stats?.totalEvents > 0
      ? ((stats.totalEvents / stats.totalUserRegistrations) * 100).toFixed(1)
      : "0.0";

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    );
  }

  const hourlyData = getHourlyChartData();
  const dailyData = getDailyChartData();
  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count), 1);
  const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <div className="min-h-[100vh] w-full bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Analytics Dashboard
              </h1>
              <p className="mt-0.5 text-xs text-neutral-500">
                Comprehensive platform analytics and user insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                🔄 Refresh
              </button>
              <Link
                to="/"
                className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Key Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            label="Total Users"
            value={allUsers?.length || 0}
            icon="👥"
            color="text-blue-600"
          />
          <MetricCard
            label="Profile Views"
            value={stats.totalProfileViews}
            icon="👁️"
            color="text-purple-600"
          />
          <MetricCard
            label="Link Clicks"
            value={stats.totalLinkClicks}
            icon="🔗"
            color="text-green-600"
          />
          <MetricCard
            label="Registrations"
            value={stats.totalUserRegistrations}
            icon="✨"
            color="text-indigo-600"
          />
          <MetricCard
            label="Links Added"
            value={stats.totalLinkAdditions}
            icon="➕"
            color="text-orange-600"
          />
          <MetricCard
            label="CTR"
            value={`${ctr}%`}
            icon="📈"
            color="text-red-600"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-lg font-semibold text-neutral-900">
              {stats.uniqueViewers}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              Unique Viewers
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-lg font-semibold text-neutral-900">
              {stats.avgLinksPerUser}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              Avg Links/User
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-lg font-semibold text-neutral-900">
              {stats.avgViewsPerUser}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              Avg Views/User
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-lg font-semibold text-neutral-900">
              {engagementRate}%
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              Engagement Rate
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Activity Charts */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Activity (Last 24 Hours)
            </h2>
            <div className="space-y-2">
              {hourlyData.map((data, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-neutral-500">{data.hour}</div>
                  <div className="flex-1">
                    <div className="flex h-6 items-center">
                      <div
                        className="h-full rounded bg-blue-500 transition-all"
                        style={{
                          width: `${(data.count / maxHourlyCount) * 100}%`,
                        }}
                      />
                      <span className="ml-2 text-xs font-medium text-neutral-700">
                        {data.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Trends */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Daily Trends (Last 7 Days)
            </h2>
            <div className="space-y-2">
              {dailyData.length > 0 ? (
                dailyData.map((data, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-neutral-500">
                      {data.date}
                    </div>
                    <div className="flex-1">
                      <div className="flex h-6 items-center">
                        <div
                          className="h-full rounded bg-green-500 transition-all"
                          style={{
                            width: `${(data.count / maxDailyCount) * 100}%`,
                          }}
                        />
                        <span className="ml-2 text-xs font-medium text-neutral-700">
                          {data.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-neutral-400">
                  No data for the last 7 days
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Most Active Users */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Most Active Users
            </h2>
            {stats.mostActiveUsers && stats.mostActiveUsers.length > 0 ? (
              <div className="space-y-2">
                {stats.mostActiveUsers.slice(0, 8).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">
                          @{user.username}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {user.views} views • {user.clicks} clicks • {user.links} links
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-neutral-600">
                      {user.total}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-neutral-400">
                No active users yet
              </div>
            )}
          </div>

          {/* Popular Link Types */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Popular Link Types
            </h2>
            {stats.popularLinkTypes && stats.popularLinkTypes.length > 0 ? (
              <div className="space-y-2">
                {stats.popularLinkTypes.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="font-medium capitalize text-neutral-900">
                        {link.type}
                      </div>
                    </div>
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {link.count} clicks
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-neutral-400">
                No link clicks yet
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Clicked Links */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Top Clicked Links
            </h2>
            {stats.topLinks && stats.topLinks.length > 0 ? (
              <div className="space-y-2">
                {stats.topLinks.slice(0, 8).map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">
                          @{link.username}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {link.linkKey}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {link.count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-neutral-400">
                No link clicks yet
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Recent Activity
            </h2>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className={`rounded-full p-1.5 ${getEventColor(activity.event)}`}>
                      <span className="text-sm">
                        {getEventIcon(activity.event)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium capitalize text-neutral-900">
                        {activity.event.replace(/_/g, " ")}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">
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
              <div className="py-8 text-center text-sm text-neutral-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

export default AdminDashboard;