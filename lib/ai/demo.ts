import type { Message } from "@/types/chat";

const categories = [
  {
    keywords: ["react", "component", "frontend", "ui"],
    templates: [
      "React is a component-driven library that helps you build interactive user interfaces with reusable logic. A good pattern is to separate UI, state, and side effects so the app remains maintainable. For a feature like this, I would usually start with a small component tree, local state, and then extract shared logic only when it becomes reusable.",
      "A clean React approach is to keep components focused and predictable: props for input, state for local behavior, and hooks for side effects. If you want to scale, split large UIs into smaller components, use typed props, and favor composition over deeply nested conditional logic.",
    ],
  },
  {
    keywords: ["javascript", "js"],
    templates: [
      "JavaScript is the foundation of interactive web experiences. It lets you manipulate the DOM, handle browser events, and connect logic to real user interactions. You can use modern features like destructuring, async/await, and modules to keep code readable and scalable.",
      "For JavaScript work, the key is writing clear logic and keeping behavior predictable. Small functions, consistent naming, and careful handling of async flows make debugging much easier and help the code age well.",
    ],
  },
  {
    keywords: ["typescript", "type", "typing"],
    templates: [
      "TypeScript improves safety by catching mistakes before runtime and making interfaces and data contracts clearer. It is especially valuable in larger codebases where shared types reduce friction between frontend and backend teams.",
      "Using TypeScript well means modeling your app’s data shape early. Strong types help you validate props, API responses, and state transitions before they become bugs.",
    ],
  },
  {
    keywords: ["python", "data", "script"],
    templates: [
      "Python is excellent for automation, data processing, and AI workflows because it is simple to read and has a rich ecosystem. A typical workflow is to clean data, transform it into a usable structure, and then run analysis or model training with a clear pipeline.",
      "In Python, I usually aim for readable functions and tests around the core logic. Small, composable steps make scripts easier to maintain and less error-prone over time.",
    ],
  },
  {
    keywords: ["ai", "machine learning", "ml", "llm", "language model"],
    templates: [
      "AI applications work best when the system combines strong prompts, well-structured data, and a clear user workflow. The most useful tools are often those that improve decision-making, summarize information, and automate repetitive work without overwhelming the user.",
      "Machine learning and AI systems are strongest when the problem is well-defined and the feedback loop is clear. Good evaluation, testing, and iteration matter just as much as model choice when building trustworthy AI experiences.",
    ],
  },
  {
    keywords: ["business", "marketing", "strategy"],
    templates: [
      "A strong business approach starts with a clear audience, a measurable outcome, and a practical go-to-market plan. The best marketing strategies are simple, consistent, and designed around the customer journey rather than isolated tactics.",
      "For a business or marketing idea, I would focus on positioning, value proposition, and conversion. Once the customer problem is clear, the rest of the plan becomes much easier to structure and communicate.",
    ],
  },
  {
    keywords: ["seo", "search", "content"],
    templates: [
      "SEO success comes from combining technical quality with useful content and consistent user intent. Search engines reward pages that are helpful, fast, and clearly structured, so strong information architecture and clean content strategy matter as much as keywords.",
      "A solid SEO plan usually includes keyword research, on-page clarity, internal linking, and a page experience that is easy for both users and crawlers to understand.",
    ],
  },
  {
    keywords: ["writing", "email", "copy"],
    templates: [
      "Strong writing is clear, audience-aware, and structured for action. A professional message should lead with the purpose, support it with concise details, and end with a specific next step or call to action.",
      "Whether you are writing an email or a landing page, the simplest version is often the strongest. Focus on clarity, tone, and the outcome you want the reader to feel or do next.",
    ],
  },
  {
    keywords: ["software", "development", "engineering"],
    templates: [
      "Good software engineering balances correctness, maintainability, and speed. A reliable plan usually starts by clarifying the problem, designing the core workflow, and then iterating with tests and feedback as the feature evolves.",
      "The strongest engineering teams treat code quality as a product feature. Readable design, well-scoped changes, and clear communication around trade-offs produce more stable delivery over time.",
    ],
  },
];

function getCategoryResponse(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  const match = categories.find((entry) =>
    entry.keywords.some((keyword) => lowerPrompt.includes(keyword)),
  );

  if (match) {
    const template =
      match.templates[Math.floor(Math.random() * match.templates.length)] ??
      "Here is a practical approach to that topic.";
    return `${template}\n\nYou can make this even stronger by focusing on the user outcome, simplifying the process, and testing the idea in small iterations.`;
  }

  return "I can help with that. A good starting point is to define the goal clearly, identify the constraints, and then outline the best path forward with practical steps you can act on immediately.";
}

export function generateDemoResponse(prompt: string, messages: Message[] = []) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("api")) {
    return "An API is a way for software systems to communicate with each other in a structured and consistent way. It defines the requests that can be made, the data format that is expected, and the response a system should return. In practice, APIs are what connect apps, services, and data sources without exposing all internal logic.";
  }

  if (lowerPrompt.includes("ai") || lowerPrompt.includes("chatbot")) {
    return "A helpful AI assistant focuses on understanding the user goal, organizing information, and giving clear, actionable responses. The best AI experiences feel natural, context-aware, and efficient without being overly verbose or robotic.";
  }

  if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
    return "Hi! I’m ready to help with ideas, technical questions, writing, planning, or product thinking. What would you like to explore today?";
  }

  const previousContext = messages.length > 0 ? "Using the context from the conversation, " : "";
  return `${previousContext}${getCategoryResponse(prompt)}`;
}

export async function streamDemoResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  messages: Message[] = [],
) {
  const response = generateDemoResponse(prompt, messages);
  const words = response.split(/(\s+)/);

  return new Promise<string>((resolve) => {
    let index = 0;

    const interval = setInterval(() => {
      const currentChunk = words[index] ?? "";
      if (!currentChunk) {
        clearInterval(interval);
        resolve(response);
        return;
      }

      onChunk(currentChunk);
      index += 1;
    }, 22);
  });
}
