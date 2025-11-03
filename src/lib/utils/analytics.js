// Analytics tracking utility
class Analytics {
  static trackEvent(eventName, data = {}) {
    try {
      const events = JSON.parse(localStorage.getItem("analytics_events") || "[]");
      events.push({
        event: eventName,
        data,
        timestamp: Date.now(),
      });
      // Keep only last 5000 events
      if (events.length > 5000) {
        events.shift();
      }
      localStorage.setItem("analytics_events", JSON.stringify(events));
    } catch (e) {
      console.error("Analytics error:", e);
    }
  }

  static getEvents(eventName = null) {
    try {
      const events = JSON.parse(localStorage.getItem("analytics_events") || "[]");
      if (eventName) {
        return events.filter((e) => e.event === eventName);
      }
      return events;
    } catch (e) {
      return [];
    }
  }

  static trackProfileView(username) {
    this.trackEvent("profile_view", { username });
  }

  static trackLinkClick(username, linkKey, linkUrl) {
    this.trackEvent("link_click", { username, linkKey, linkUrl });
  }

  static trackUserRegistration(username, address) {
    this.trackEvent("user_registered", { username, address });
  }

  static trackLinkAdded(username, linkKey) {
    this.trackEvent("link_added", { username, linkKey });
  }

  static getStats() {
    const events = this.getEvents();
    const profileViews = this.getEvents("profile_view");
    const linkClicks = this.getEvents("link_click");
    const userRegistrations = this.getEvents("user_registered");
    const linkAdditions = this.getEvents("link_added");

    // Get unique users who viewed profiles
    const uniqueViewers = new Set(
      profileViews.map((e) => e.data.username || "unknown")
    );

    // Get top clicked links
    const linkClickCounts = {};
    linkClicks.forEach((e) => {
      const key = `${e.data.username}-${e.data.linkKey}`;
      linkClickCounts[key] = (linkClickCounts[key] || 0) + 1;
    });

    const topLinks = Object.entries(linkClickCounts)
      .map(([key, count]) => {
        const [username, linkKey] = key.split("-");
        return { username, linkKey, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get recent activity (last 24 hours)
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recentActivity = events.filter((e) => e.timestamp > last24Hours);

    // Hourly breakdown (last 24 hours)
    const hourlyBreakdown = {};
    const last24hEvents = events.filter((e) => e.timestamp > last24Hours);
    last24hEvents.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
    });

    // Daily breakdown (last 7 days)
    const dailyBreakdown = {};
    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7DaysEvents = events.filter((e) => e.timestamp > last7Days);
    last7DaysEvents.forEach((e) => {
      const date = new Date(e.timestamp).toLocaleDateString();
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
    });

    // Most active users
    const userActivity = {};
    events.forEach((e) => {
      const username = e.data.username || "unknown";
      if (!userActivity[username]) {
        userActivity[username] = { views: 0, clicks: 0, links: 0 };
      }
      if (e.event === "profile_view") userActivity[username].views++;
      if (e.event === "link_click") userActivity[username].clicks++;
      if (e.event === "link_added") userActivity[username].links++;
    });

    const mostActiveUsers = Object.entries(userActivity)
      .map(([username, data]) => ({
        username,
        ...data,
        total: data.views + data.clicks + data.links,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Popular link types
    const linkTypeCounts = {};
    linkClicks.forEach((e) => {
      const type = e.data.linkKey?.toLowerCase() || "unknown";
      linkTypeCounts[type] = (linkTypeCounts[type] || 0) + 1;
    });

    const popularLinkTypes = Object.entries(linkTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // User growth timeline
    const userGrowth = [];
    const sortedRegistrations = userRegistrations.sort(
      (a, b) => a.timestamp - b.timestamp
    );
    sortedRegistrations.forEach((reg, index) => {
      userGrowth.push({
        date: new Date(reg.timestamp).toLocaleDateString(),
        count: index + 1,
      });
    });

    // Calculate averages (need to pass totalUsers from dashboard)
    const avgLinksPerUser =
      linkAdditions.length > 0 && userRegistrations.length > 0
        ? (linkAdditions.length / userRegistrations.length).toFixed(2)
        : "0.00";
    const avgViewsPerUser =
      profileViews.length > 0 && userRegistrations.length > 0
        ? (profileViews.length / userRegistrations.length).toFixed(2)
        : "0.00";

    return {
      totalEvents: events.length,
      totalProfileViews: profileViews.length,
      totalLinkClicks: linkClicks.length,
      totalUserRegistrations: userRegistrations.length,
      totalLinkAdditions: linkAdditions.length,
      uniqueViewers: uniqueViewers.size,
      topLinks,
      recentActivity: recentActivity.slice(-20).reverse(),
      hourlyBreakdown,
      dailyBreakdown,
      mostActiveUsers,
      popularLinkTypes,
      userGrowth,
      avgLinksPerUser: avgLinksPerUser.toFixed(2),
      avgViewsPerUser: avgViewsPerUser.toFixed(2),
    };
  }
}

export default Analytics;

