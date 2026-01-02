import { useCallback, useRef, useState } from "react";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { VoiceState } from "./voiceTypes";
import api from "../api/axios";
import { showToast } from "../utils";

interface VoiceMessage {
  type: string;
  text?: string;
}

export function useVoiceAssistant() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const roomRef = useRef<Room | null>(null);
  const stop = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    setTranscript("");
    setState("idle");
  }, []);
  const start = useCallback(async () => {
    if (state !== "idle") return;

    setState("connecting");

    try {
      // 1️⃣ Get LiveKit token from backend
      const res = await api.get("/ai/voice/token");
      const { livekitUrl, livekitToken } = res.data;

      // 2️⃣ Connect LiveKit (handles both audio + data channel)
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      await room.connect(livekitUrl, livekitToken);
      console.log("connected to room", room.name);
      if (room.state === "connected") {
        const res = await api.post("/ai/voice/start", { roomName: room.name });
        console.log(res.data.message);
      }
      // 3️⃣ Publish microphone
      if (process.env.NODE_ENV === "production") {
        const micTrack = await createLocalAudioTrack();
        await room.localParticipant.publishTrack(micTrack);
        await room.localParticipant.setMicrophoneEnabled(true);
        setState("listening");
      }

      roomRef.current = room;

      // 4️⃣ Handle assistant audio playback automatically
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "audio") {
          track.attach();
        }
      });

      // 5️⃣ Handle data messages from voice agent (transcripts, status)
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const decoder = new TextDecoder();
          const text = decoder.decode(payload);
          const message: VoiceMessage = JSON.parse(text);

          switch (message.type) {
            case "stt_partial":
              if (message.text) {
                setTranscript(message.text);
                setState("listening");
              }
              break;

            case "stt_final":
              if (message.text) {
                setTranscript(message.text);
                setState("processing");
              }
              break;

            case "ai_speaking":
              setState("speaking");
              break;

            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("Failed to parse data message:", err);
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        const remoteCount = room.remoteParticipants.size;

        // Only local participant left → agent is gone
        if (remoteCount === 0) {
          console.warn("No remote participants left, closing room");
          showToast("Voice assistant disconnected", { type: "error" });

          room.disconnect();
          stop();
        }
      });

      // 6️⃣ Handle disconnection
      room.on(RoomEvent.Disconnected, () => {
        setState("idle");
        setTranscript("");
      });
    } catch (err) {
      console.error("Voice assistant error:", err);
      setState("error");
    }
  }, [state, stop]);

  const sendTestText = useCallback(
    async (text: string) => {
      if (!roomRef.current) {
        start();
        console.warn("Room not connected");
        return;
      }

      const packet = {
        type: "test_text",
        text,
      };

      await roomRef.current.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(packet)),
        { reliable: true },
      );

      // Simulate UI state
      setTranscript(text);
      setState("processing");
    },
    [start],
  );

  return {
    state,
    transcript,
    start,
    stop,
    sendTestText,
  };
}
