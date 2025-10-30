import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/${username.trim()}`);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="blockchain-icon">⛓️</div>
        <h1 className="title">Onchain Linktree</h1>
        <p className="subtitle">
          Your decentralized link hub on the blockchain
        </p>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🔗</div>
            <h3>Immutable Links</h3>
            <p>Store your links permanently on the blockchain</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔐</div>
            <h3>Fully Decentralized</h3>
            <p>Own your data without intermediaries</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>Web3 Ready</h3>
            <p>Connect with your crypto wallet</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>View a Profile</h2>
          <form onSubmit={handleSubmit} className="username-form">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
            <button type="submit" className="submit-btn">
              View Profile →
            </button>
          </form>
          <p className="demo-text">
            Try example:{" "}
            <button onClick={() => navigate("/vitalik")} className="link-btn">
              vitalik
            </button>{" "}
            or{" "}
            <button onClick={() => navigate("/satoshi")} className="link-btn">
              satoshi
            </button>
          </p>
        </div>
      </div>

      <footer className="footer">
        <p>Built on Web3 • Powered by the Blockchain</p>
      </footer>
    </div>
  );
}

export default Home;
