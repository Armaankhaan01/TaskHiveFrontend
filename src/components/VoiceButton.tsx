import { Mic, MicOff } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";
import { AIButton } from "../styles";

export function VoiceButton({ glow }: { glow: boolean }) {
  const { state, start, stop } = useVoiceAssistant();

  const isActive =
    state === "connecting" ||
    state === "listening" ||
    state === "processing" ||
    state === "speaking";

  return (
    <Tooltip title="For Assistant" placement="right">
      <AIButton
        onClick={isActive ? stop : start}
        aria-label="Mic for AI"
        glow={glow}
        style={{
          background:
            state === "listening" ? "#4caf50" : state === "processing" ? "#ff9800" : "#111",
          boxShadow: glow ? "0 0 20px #00e5ff" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {isActive ? <Mic style={{ fontSize: 44 }} /> : <MicOff style={{ fontSize: 44 }} />}
      </AIButton>
    </Tooltip>
  );
}
