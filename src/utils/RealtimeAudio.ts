// utils/RealtimeAudio.ts - DEPRECATED, use AudioRecorder.ts instead

import { AudioRecorder } from './AudioRecorder';

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private isConnected = false;
  private bridgeReady = false;

  private transcriptBuffer = ''; // buffer partial deltas
  private lastEmitTime = 0;

  constructor(
    private onMessage: (data: any) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const projectId = 'whckoleflooauwxsrzjg'; // supabase project id
        this.ws = new WebSocket(
          `wss://${projectId}.supabase.co/functions/v1/realtime-interview`
        );

        this.ws.onopen = () => {
          console.log('Connected to realtime service');
          this.isConnected = true;
          this.onConnectionChange(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // --- Handle transcription buffering ---
            if (data.type === 'conversation.item.input_audio_transcription.delta') {
              // accumulate partial transcript
              this.transcriptBuffer += data.delta || '';
            }

            if (
              data.type === 'conversation.item.input_audio_transcription.completed'
            ) {
              // flush buffer + final transcript
              const fullTranscript =
                this.transcriptBuffer + (data.transcript || '');
              this.transcriptBuffer = ''; // reset buffer
              this.onMessage({
                type: 'conversation.item.input_audio_transcription.completed',
                transcript: fullTranscript,
              });
              return;
            }

            if (
              data.type === 'conversation.item.input_audio_transcription.failed'
            ) {
              this.transcriptBuffer = '';
            }

            // throttle non-critical spam (debug, deltas, rate limits)
            const now = Date.now();
            if (
              ['rate_limits.updated', 'response.output_audio.delta'].includes(
                data.type
              )
            ) {
              if (now - this.lastEmitTime < 200) return; // 5 events/sec max
              this.lastEmitTime = now;
            }

            this.onMessage(data);
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          reject(err);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.isConnected = false;
          this.bridgeReady = false;
          this.onConnectionChange(false);
          this.stopRecording();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async startRecording(): Promise<void> {
    if (!this.bridgeReady || !this.ws) {
      throw new Error('Not connected to realtime service');
    }

    console.log('Starting audio recording...');
    let audioFrameCount = 0;
    let lastSentTime = 0;
    const minSendInterval = 50;

    // This is deprecated - use the new AudioRecorder for simple recording
    this.recorder = new AudioRecorder();
    console.log('Audio recording started (deprecated RealtimeClient)');

    await this.recorder.start();
    console.log('Audio recording started');
  }

  stopRecording(): void {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
  }

  sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  commitAudioBuffer(): void {
    this.sendMessage({ type: 'input_audio_buffer.commit' });
  }

  requestResponse(): void {
    this.sendMessage({ type: 'response.create' });
  }

  disconnect(): void {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.bridgeReady = false;
  }

  get connected(): boolean {
    return this.isConnected && this.bridgeReady;
  }
}
