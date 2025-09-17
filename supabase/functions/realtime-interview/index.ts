// supabase/functions/realtime-interview/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("OPENAI_API_KEY missing");
    socket.close(1011, "missing key");
    return response;
  }

  let openAISocket: WebSocket | null = null;
  let allowResponse = false; // ✅ gate so AI only replies when you want

  try {
    const sessionId = crypto.randomUUID();
    const url =
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

    openAISocket = new WebSocket(url, [
      "realtime",
      `openai-insecure-api-key.${apiKey}`,
      `openai-insecure-session-id.${sessionId}`,
    ]);

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
      socket.send(JSON.stringify({ type: "bridge.ready" }));

      openAISocket?.send(
        JSON.stringify({
          type: "session.update",
          session: {
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000,
            },
            instructions:
              "You are an interview coach. Do not respond unless a response.create event is explicitly sent.",
          },
        }),
      );
    };

    openAISocket.onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type === "response.created" && !allowResponse) {
        console.log("Blocking unsolicited response");
        openAISocket?.send(JSON.stringify({ type: "response.cancel" }));
        return;
      }

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(evt.data);
      }
    };

    socket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "response.create") {
        // ✅ allow response only when user explicitly submits
        allowResponse = true;
        openAISocket?.send(evt.data);
        // reset after a short delay so AI doesn’t keep talking
        setTimeout(() => (allowResponse = false), 5000);
        return;
      }

      if (msg.type === "input_audio_buffer.append") {
        if (!msg.audio) {
          console.warn("Dropped append: missing audio payload");
          return;
        }
      }

      openAISocket?.send(evt.data);
    };

    socket.onclose = () => openAISocket?.close();
    socket.onerror = () => openAISocket?.close();

    openAISocket.onerror = (err) => {
      console.error("OpenAI error:", err);
      socket.send(JSON.stringify({ type: "error", message: "OpenAI error" }));
    };

    openAISocket.onclose = () => socket.close();
  } catch (err) {
    console.error("Bridge error:", err);
    socket.close(1011, "Bridge error");
  }

  return response;
});
