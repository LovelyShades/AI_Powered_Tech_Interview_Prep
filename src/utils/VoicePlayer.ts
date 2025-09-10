import { supabase } from '@/integrations/supabase/client';

export class VoicePlayer {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private onPlayingChange?: (playing: boolean) => void;

  constructor(onPlayingChange?: (playing: boolean) => void) {
    this.onPlayingChange = onPlayingChange;
  }

  async speak(text: string, voice: string = 'alloy'): Promise<void> {
    try {
      // Stop any current playback
      this.stop();

      // Generate speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        throw error;
      }

      // Create audio element and play
      this.audioElement = new Audio();
      this.audioElement.src = `data:audio/mp3;base64,${data.audioContent}`;
      
      this.audioElement.onloadstart = () => {
        this.isPlaying = true;
        this.onPlayingChange?.(true);
      };

      this.audioElement.onended = () => {
        this.isPlaying = false;
        this.onPlayingChange?.(false);
      };

      this.audioElement.onerror = () => {
        this.isPlaying = false;
        this.onPlayingChange?.(false);
      };

      await this.audioElement.play();
    } catch (error) {
      console.error('Error playing speech:', error);
      this.isPlaying = false;
      this.onPlayingChange?.(false);
      throw error;
    }
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    this.isPlaying = false;
    this.onPlayingChange?.(false);
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.onPlayingChange?.(false);
    }
  }

  resume(): void {
    if (this.audioElement) {
      this.audioElement.play();
      this.isPlaying = true;
      this.onPlayingChange?.(true);
    }
  }

  get playing(): boolean {
    return this.isPlaying;
  }
}