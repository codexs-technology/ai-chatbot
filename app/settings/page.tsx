"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Moon, SunMedium } from "lucide-react";
import { getStoredSettings, saveStoredSettings } from "@/lib/storage";
import type { DemoSettings } from "@/types/chat";

export default function SettingsPage() {
  const [settings, setSettings] = useState<DemoSettings>({
    appearance: "dark",
    enterToSend: true,
    aiMode: "demo",
  });

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const updateSettings = (partial: Partial<DemoSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveStoredSettings(next);
  };

  return (
    <div className="min-h-screen bg-[#07090b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/chat" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Preferences</p>
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
        </div>

        <div className="space-y-6 rounded-[28px] border border-white/10 bg-[#111214] p-5 md:p-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => updateSettings({ appearance: "dark" })}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${settings.appearance === "dark" ? "border-white/20 bg-white/10" : "border-white/10 bg-transparent"}`}
              >
                <span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Dark mode</span>
                <span className="text-xs text-zinc-400">Active</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ appearance: "light" })}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${settings.appearance === "light" ? "border-white/20 bg-white/10" : "border-white/10 bg-transparent"}`}
              >
                <span className="flex items-center gap-2"><SunMedium className="h-4 w-4" /> Light mode</span>
                <span className="text-xs text-zinc-400">Preview</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Chat</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-transparent px-4 py-3">
                <span>Clear conversations</span>
                <button type="button" onClick={() => localStorage.removeItem("ai-chatbot-demo-conversations")} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5">Clear</button>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <span>Enter to send</span>
                <input
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(event) => updateSettings({ enterToSend: event.target.checked })}
                  className="h-4 w-4 accent-white"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">AI</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => updateSettings({ aiMode: "demo" })}
                className={`rounded-xl border px-4 py-3 ${settings.aiMode === "demo" ? "border-white/20 bg-white/10" : "border-white/10 bg-transparent"}`}
              >
                Demo AI
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ aiMode: "real" })}
                className={`rounded-xl border px-4 py-3 ${settings.aiMode === "real" ? "border-white/20 bg-white/10" : "border-white/10 bg-transparent"}`}
              >
                Real AI
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">About</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>AI Chatbot</li>
              <li>Portfolio Demo</li>
              <li>Version 1.0</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
