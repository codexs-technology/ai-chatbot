import { NextResponse } from "next/server";

const systemPrompt = `You are a helpful, knowledgeable, and professional AI assistant.

Answer the user's questions clearly and accurately.
Use concise explanations when the question is simple and detailed explanations when the question requires depth.
When writing code:
- Provide clean and maintainable code.
- Explain important implementation details.
- Use Markdown code blocks.
- Mention assumptions when necessary.

Never pretend to have performed actions that you did not actually perform.
If information is uncertain, communicate uncertainty clearly.
Maintain conversation context and use previous messages when relevant.
Be professional, helpful, and natural.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return NextResponse.json({ error: "No messages supplied." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI service is currently unavailable. Switch to Demo AI to continue.",
        },
        { status: 503 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((message: { role: string; content: string }) => ({
            role: message.role,
            content: String(message.content ?? ""),
          })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please configure OPENAI_API_KEY in your environment." },
          { status: 401 },
        );
      }
      return NextResponse.json({ error: `AI request failed: ${errorText}` }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(text));
          }
        } catch (error) {
          controller.enqueue(new TextEncoder().encode(`\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
