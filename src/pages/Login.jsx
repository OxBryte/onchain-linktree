import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppKit } from "@reown/appkit/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const { open, close } = useAppKit();

  return (
    <div className="min-h-[100vh] w-full bg-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your username to continue
          </p>
        </div>
        <div className="flex gap-2 flex-col">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-800 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-300"
          />
          <button
            onClick={() => open()}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
