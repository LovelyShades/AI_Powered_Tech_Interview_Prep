import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Mic, MicOff, Square, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { AudioRecorder, convertBlobToBase64 } from '@/utils/AudioRecorder';
import { VoicePlayer } from '@/utils/VoicePlayer';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LiveInterviewPanelProps {
  questionId: string;
  questionText: string;
  feedbackText?: string;
  onSubmit: (transcript: string) => void;
  isSubmitted: boolean;
  readOnly?: boolean;
}

type LiveState = 'idle' | 'recording' | 'stopped';

export const LiveInterviewPanel = ({
  questionId,
  questionText,
  feedbackText,
  onSubmit,
  isSubmitted,
  readOnly = false,
}: LiveInterviewPanelProps) => {
  const [state, setState] = useState<LiveState>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Voice playback state
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = sessionStorage.getItem('voice-playback-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const voicePlayerRef = useRef<VoicePlayer | null>(null);
  const { toast } = useToast();

  // Initialize voice player
  useEffect(() => {
    voicePlayerRef.current = new VoicePlayer(setIsPlayingVoice);
    
    return () => {
      voicePlayerRef.current?.stop();
    };
  }, []);

  // Auto-play question when it changes and voice is enabled
  useEffect(() => {
    if (voiceEnabled && questionText && !readOnly && !isSubmitted) {
      const timer = setTimeout(() => {
        voicePlayerRef.current?.speak(questionText);
      }, 500); // Small delay to ensure UI is rendered
      
      return () => clearTimeout(timer);
    }
  }, [questionId, questionText, voiceEnabled, readOnly, isSubmitted]);

  // Auto-play feedback when available and voice is enabled
  useEffect(() => {
    if (voiceEnabled && feedbackText && isSubmitted) {
      const timer = setTimeout(() => {
        voicePlayerRef.current?.speak(feedbackText);
      }, 1000); // Delay to allow answer submission to complete
      
      return () => clearTimeout(timer);
    }
  }, [feedbackText, voiceEnabled, isSubmitted]);

  // Reset when question changes
  useEffect(() => {
    setState('idle');
    setTranscript('');
    setAudioLevel(0);
    audioBlobRef.current = null;
    voicePlayerRef.current?.stop();
  }, [questionId]);

  // Save voice preference to session storage
  useEffect(() => {
    sessionStorage.setItem('voice-playback-enabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  const handleStartRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
      await recorderRef.current.start();
      setState('recording');
      toast({ title: 'Recording started', description: 'Speak your answer' });
    } catch (error) {
      toast({
        title: 'Recording failed',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    
    try {
      const audioBlob = await recorderRef.current.stop();
      audioBlobRef.current = audioBlob;
      setState('stopped');
      
      toast({ 
        title: 'Recording stopped', 
        description: 'Click submit to transcribe your answer' 
      });
    } catch (error) {
      toast({
        title: 'Error stopping recording',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!audioBlobRef.current) {
      toast({
        title: 'No recording found',
        description: 'Please record your answer first',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Stop any current voice playback
      voicePlayerRef.current?.stop();
      
      // Convert audio to base64
      const base64Audio = await convertBlobToBase64(audioBlobRef.current);
      
      // Send to transcription service
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw error;
      }

      const transcribedText = data.transcript;
      
      if (!transcribedText?.trim()) {
        toast({
          title: 'No speech detected',
          description: 'Please try recording again',
          variant: 'destructive',
        });
        return;
      }

      setTranscript(transcribedText);
      onSubmit(transcribedText.trim());
      
      toast({
        title: 'Answer submitted',
        description: 'Your response has been recorded',
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (!enabled) {
      voicePlayerRef.current?.stop();
    }
  };

  const handleVoiceControl = () => {
    if (!voicePlayerRef.current) return;
    
    if (isPlayingVoice) {
      voicePlayerRef.current.pause();
    } else {
      voicePlayerRef.current.resume();
    }
  };

  // Simulated audio meter
  useEffect(() => {
    if (state === 'recording') {
      const interval = setInterval(
        () => setAudioLevel(Math.random() * 100),
        100,
      );
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [state]);

  if (readOnly || isSubmitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {transcript ? (
            <div className="text-sm bg-muted p-3 rounded-lg">
              <strong>Transcript:</strong> {transcript}
            </div>
          ) : (
            'Voice response recorded'
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Voice Playback Controls */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Voice Playback</span>
            </div>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={handleVoiceToggle}
            />
          </div>
          
          {voiceEnabled && (
            <div className="flex items-center gap-2">
              {isPlayingVoice && (
                <Badge variant="secondary" className="gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Playing
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceControl}
                disabled={!isPlayingVoice}
              >
                {isPlayingVoice ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => voicePlayerRef.current?.stop()}
                disabled={!isPlayingVoice}
              >
                <VolumeX className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Recording Status */}
        <div className="flex items-center justify-center">
          <Badge variant={state === 'recording' ? 'destructive' : 'secondary'}>
            {state === 'idle' && 'Ready to record'}
            {state === 'recording' && '● Recording'}
            {state === 'stopped' && 'Recording complete'}
          </Badge>
        </div>

        {/* Audio Level Indicator */}
        {state === 'recording' && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-1 rounded-full transition-colors ${
                  i < audioLevel / 10 ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {state === 'idle' && (
            <Button onClick={handleStartRecording}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}
          
          {state === 'recording' && (
            <Button variant="outline" onClick={handleStopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
          
          {state === 'stopped' && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleStartRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Record Again
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                disabled={submitting}
              >
                {submitting ? 'Transcribing...' : 'Submit Answer'}
              </Button>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Your transcribed answer:</h4>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {state === 'idle' && (
          <div className="text-center text-muted-foreground text-sm">
            Click "Start Recording" to record your voice answer
          </div>
        )}
      </CardContent>
    </Card>
  );
};
