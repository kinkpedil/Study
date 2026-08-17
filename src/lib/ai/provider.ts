import "server-only";

/**
 * Abstraksi provider AI (gateway OpenRouter). Semua fitur AI (generator soal,
 * bantuan PR, tutor, moderasi) memanggil lewat sini agar API key hanya ada di
 * server dan model bisa diganti lewat environment. Kunci TIDAK pernah dikirim
 * ke browser.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  /** Minta respons berupa objek JSON. */
  json?: boolean;
  maxTokens?: number;
  signal?: AbortSignal;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-sonnet";

export class AIError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AIError";
  }
}

/**
 * Menjalankan chat completion dan mengembalikan konten teks balasan.
 * Melempar AIError bila konfigurasi kurang atau permintaan gagal.
 */
export async function chatComplete(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AIError(
      "OPENROUTER_API_KEY belum diset. Lihat .env.example.",
      500,
    );
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      messages,
      ...(options.json
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AIError(
      `Permintaan AI gagal (${res.status}). ${detail.slice(0, 200)}`,
      res.status,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIError("Respons AI kosong atau tidak valid.", 502);
  }
  return content;
}

/** Chat completion yang mem-parse balasan JSON menjadi objek bertipe T. */
export async function chatJson<T>(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<T> {
  const raw = await chatComplete(messages, { ...options, json: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new AIError("Gagal mem-parse JSON dari respons AI.", 502);
  }
}
