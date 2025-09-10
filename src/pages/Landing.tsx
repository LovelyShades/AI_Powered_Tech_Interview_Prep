import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Play, Code, MessageSquare, Brain, Clock, Target, Users, Mic, Terminal, Shield, Zap } from "lucide-react";
import { SettingsSheet } from "@/components/interview/SettingsSheet";
import { AuthButton } from "@/components/auth/AuthButton";
import { useSessionStore } from "@/lib/store/sessionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MatrixRain } from "@/components/effects/MatrixRain";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";

export interface InterviewSettings {
  difficulty: "Easy" | "Medium" | "Hard";
  numberOfQuestions: number;
  timerMinutes: number;
  quickFeedback: boolean;
  liveMode: boolean;
  category: "software_engineering" | "frontend_ui" | "ai_ml" | "cloud_devops" | "database_data" | "it_systems" | "security_cyber";
  questionSource: "curated" | "leetcode-style";
}

const defaultSettings: InterviewSettings = {
  difficulty: "Easy",
  numberOfQuestions: 5,
  timerMinutes: 10,
  quickFeedback: true,
  liveMode: false,
  category: "software_engineering",
  questionSource: "curated"
};

const getCategoryDisplayName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'software_engineering': 'Software Engineering / Full-Stack Dev',
    'frontend_ui': 'Frontend Development / UI',
    'ai_ml': 'AI / Machine Learning',
    'cloud_devops': 'Cloud & DevOps',
    'database_data': 'Database / Data Engineering',
    'it_systems': 'IT / Systems / Support',
    'security_cyber': 'Security / Cybersecurity'
  };
  return categoryMap[category] || category;
};

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession } = useSessionStore();
  const [settings, setSettings] = useState<InterviewSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);
    
    try {
      // Clear any previous session data when starting a new interview
      localStorage.removeItem('currentSessionQuestions');
      
      // Get question IDs using secure function (only returns metadata, no answers)
      const { data: questions, error } = await supabase.rpc('get_questions_for_session', {
        p_difficulty: settings.difficulty as 'Easy' | 'Medium' | 'Hard',
        p_category: settings.category as any,
        p_limit: settings.numberOfQuestions * 2 // Get more questions for variety
      });

      if (error) throw error;
      if (!questions || questions.length === 0) {
        throw new Error('No questions available for the selected criteria');
      }
      
      // Shuffle and select questions for this session (no cross-session tracking)
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      let selectedQuestions = shuffledQuestions.slice(0, settings.numberOfQuestions);
      
      if (settings.questionSource === 'leetcode-style') {
        // Only coding questions for LeetCode-style
        selectedQuestions = shuffledQuestions.filter(q => q.qtype === 'Coding').slice(0, settings.numberOfQuestions);
      }
      
      // Store current session questions to prevent duplicates within this session only
      localStorage.setItem('currentSessionQuestions', JSON.stringify(selectedQuestions.map(q => q.question_id.toString())));
      
      if (selectedQuestions.length === 0) {
        throw new Error(`No ${settings.questionSource === 'leetcode-style' ? 'coding' : ''} questions available for ${settings.difficulty} difficulty`);
      }
      
      if (selectedQuestions.length < settings.numberOfQuestions) {
        toast({
          title: "Limited questions available",
          description: `Only ${selectedQuestions.length} ${settings.questionSource === 'leetcode-style' ? 'coding ' : ''}questions available for ${settings.difficulty} difficulty.`,
          variant: "default",
        });
      }

      // Create session
      const sessionData = {
        settings: settings as any, // Cast to satisfy Json type
        question_ids: selectedQuestions.map((q: any) => q.question_id.toString()),
        current_index: 0
      };

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert({ ...sessionData, user_id: user.id })
          .select()
          .single();

        if (sessionError) throw sessionError;
        
        // Set session in store and navigate
        const mappedQuestions = selectedQuestions.map(q => ({
          ...q,
          question_id: q.question_id.toString()
        }));
        setSession(session.id, mappedQuestions, settings);
        navigate(`/interview/${session.id}`);
      } else {
        // Guest mode - use local storage
        const sessionId = crypto.randomUUID();
        const mappedQuestions = selectedQuestions.map(q => ({
          ...q,
          question_id: q.question_id.toString()
        }));
        setSession(sessionId, mappedQuestions, settings);
        navigate(`/interview/${sessionId}`);
      }
      
    } catch (error) {
      console.error('Start interview error:', error);
      toast({
        title: "Failed to start interview",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-purple-900/95 z-10" />
      
      {/* Noise Texture */}
      <div 
        className="fixed inset-0 opacity-[0.015] z-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-30">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-md border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                InterviewAI
              </h1>
              <p className="text-xs text-blue-300">Technical Interview Coach</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-blue-300 hover:text-white hover:bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <AuthButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">AI-Powered Interview Practice</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                  Master Your
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                    Tech Interviews
                  </span>
                </h1>
                
                <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Practice coding challenges, system design, and behavioral questions with real-time AI feedback. 
                  Choose between interactive text mode or immersive voice conversations.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                <div className="flex items-center gap-2 text-slate-300">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">500+ Questions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">10K+ Interviews</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Enterprise Ready</span>
                </div>
              </div>
              
              {/* Settings Preview */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  {settings.difficulty}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                  {settings.numberOfQuestions} Questions
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {settings.timerMinutes} Min
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                  {getCategoryDisplayName(settings.category)}
                </Badge>
                {settings.liveMode && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
                    <Mic className="h-3 w-3 mr-1" />
                    Live Mode
                  </Badge>
                )}
              </div>
              
              <Button
                size="lg"
                onClick={handleStartInterview}
                disabled={isStarting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-lg rounded-xl shadow-2xl shadow-blue-500/25 border border-blue-500/30 transition-all duration-200 hover:scale-105"
              >
                <Play className="h-6 w-6 mr-3" />
                {isStarting ? 'Starting Interview...' : 'Start Interview'}
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-black/40 backdrop-blur-md border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <Code className="h-8 w-8 text-blue-400" />
                    </div>
                    <Terminal className="h-5 w-5 text-slate-500" />
                  </div>
                  <CardTitle className="text-white text-xl font-bold">
                    Coding Challenges
                  </CardTitle>
                  <CardDescription className="text-slate-400 leading-relaxed">
                    Practice with real interview problems using our advanced Monaco editor. Get instant feedback on your solutions with detailed explanations.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-md border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                      <Mic className="h-8 w-8 text-purple-400" />
                    </div>
                    <MessageSquare className="h-5 w-5 text-slate-500" />
                  </div>
                  <CardTitle className="text-white text-xl font-bold">
                    Live Voice Mode
                  </CardTitle>
                  <CardDescription className="text-slate-400 leading-relaxed">
                    Experience realistic interviews with voice interaction. Practice speaking through your solutions just like in real interviews.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-md border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                      <Brain className="h-8 w-8 text-cyan-400" />
                    </div>
                    <Target className="h-5 w-5 text-slate-500" />
                  </div>
                  <CardTitle className="text-white text-xl font-bold">
                    AI Feedback
                  </CardTitle>
                  <CardDescription className="text-slate-400 leading-relaxed">
                    Get personalized insights on your performance, code quality, and communication skills to improve for your next interview.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Sheet */}
      <SettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={setSettings}
        onStartInterview={handleStartInterview}
      />
    </div>
  );
};

export default Landing;