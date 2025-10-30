import { useParams, Link } from "react-router-dom";
import "./UserProfile.css";

function UserProfile() {
  const { username } = useParams();

  // Mock data - in a real app, this would come from blockchain
  const profileData = {
    vitalik: {
      name: "Vitalik Buterin",
      bio: "Co-founder of Ethereum",
      avatar: "🦄",
      links: [
        {
          title: "Twitter",
          url: "https://twitter.com/VitalikButerin",
          icon: "🐦",
        },
        { title: "GitHub", url: "https://github.com/vbuterin", icon: "💻" },
        { title: "Blog", url: "https://vitalik.eth.limo", icon: "📝" },
        {
          title: "Ethereum Foundation",
          url: "https://ethereum.org",
          icon: "⛓️",
        },
      ],
    },
    satoshi: {
      name: "Satoshi Nakamoto",
      bio: "Creator of Bitcoin",
      avatar: "₿",
      links: [
        {
          title: "Bitcoin Whitepaper",
          url: "https://bitcoin.org/bitcoin.pdf",
          icon: "📄",
        },
        { title: "Bitcoin.org", url: "https://bitcoin.org", icon: "🌐" },
        {
          title: "The Genesis Block",
          url: "https://blockchair.com/bitcoin/block/0",
          icon: "🔗",
        },
      ],
    },
  };

  const profile = profileData[username.toLowerCase()] || {
    name: username,
    bio: "Decentralized profile on the blockchain",
    avatar: "👤",
    links: [
      { title: "Example Link 1", url: "#", icon: "🔗" },
      { title: "Example Link 2", url: "#", icon: "🔗" },
      { title: "Example Link 3", url: "#", icon: "🔗" },
    ],
  };

  return (
    <div className="profile-container">
      <Link to="/" className="back-btn">
        ← Back to Home
      </Link>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">{profile.avatar}</div>
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-username">@{username}</p>
          <p className="profile-bio">{profile.bio}</p>
          <div className="blockchain-badge">
            <span className="badge-icon">🔐</span>
            <span>Verified Onchain</span>
          </div>
        </div>

        <div className="links-container">
          {profile.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-title">{link.title}</span>
              <span className="link-arrow">→</span>
            </a>
          ))}
        </div>

        <div className="profile-footer">
          <p>Stored permanently on the blockchain</p>
          <div className="network-info">
            <span className="status-dot"></span>
            <span>Network: Ethereum Mainnet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
