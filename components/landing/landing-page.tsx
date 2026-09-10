import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Sparkles, Zap } from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    title: "Smart Conversations",
    description:
      "Natural, context-aware conversations with AI that understands your needs and delivers helpful responses.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Fast, responsive AI interactions with streaming-style responses for a smooth conversational experience.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Designed with privacy-conscious architecture and secure API handling for your AI interactions.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">AI Chatbot</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/login" className="transition hover:text-white">Sign In</Link>
          <Link href="/signup" className="rounded-full border border-white/10 bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200">Get Started</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-8 md:pt-16">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Conversations
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            AI-Powered Conversations
            <span className="mt-2 block text-zinc-400">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 md:text-lg">
            Experience the future of communication with an intelligent AI chatbot. Get instant answers, generate content, and boost your productivity with AI.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/chat" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">Everything You Need</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-lg shadow-black/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-zinc-500">
        © 2026 AI Chatbot. All rights reserved.
      </footer>
    </div>
  );
}
