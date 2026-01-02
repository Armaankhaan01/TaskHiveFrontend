export type VoiceState = "idle" | "connecting" | "listening" | "processing" | "speaking" | "error";

export type VoiceSocketEvent =
  | { type: "stt_partial"; text: string }
  | { type: "stt_final"; text: string }
  | { type: "ai_thinking" }
  | { type: "ai_speaking" }
  | { type: "error"; message: string };
