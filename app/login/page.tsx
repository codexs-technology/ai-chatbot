"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Eye, EyeOff } from "lucide-react";
import { saveStoredSession } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveStoredSession({ name: "Demo User", email });
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090b] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111214] p-6 shadow-2xl shadow-black/25">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold">AI Chatbot</span>
        </div>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#181a1d] px-3 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-zinc-300">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#181a1d] px-3 py-3 pr-11 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
            Sign In
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm text-zinc-300">
          <button type="button" onClick={() => { saveStoredSession({ name: "Demo User", email: "demo@example.com" }); router.push("/chat"); }} className="font-medium text-white underline underline-offset-4">
            Continue as Demo User
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-400">
          Need an account? <Link href="/signup" className="font-medium text-white">Create one</Link>
        </p>
      </div>
    </div>
  );
}
