import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Play, Code, MessageSquare, Brain, Clock, Target, Users, Mic, Terminal, Shield, Zap, Star, CheckCircle } from "lucide-react";
import { SettingsSheet } from "@/components/interview/SettingsSheet";
import { AuthButton } from "@/components/auth/AuthButton";
import { useSessionStore } from "@/lib/store/sessionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">InterviewAI</h1>
                <p className="text-sm text-muted-foreground">Technical Interview Coach</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="transition-smooth p-2 sm:px-3"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Settings</span>
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8">
            <Badge className="bg-gradient-primary text-white px-4 py-2 text-sm font-medium shadow-glow">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Interview Practice
            </Badge>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight">
            Master Your
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Tech Interviews
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Practice coding challenges, system design, and behavioral questions with real-time AI feedback. 
            Choose between interactive text mode or immersive voice conversations.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">500+ Questions</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-accent" />
              <span className="font-medium">10K+ Interviews</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-success" />
              <span className="font-medium">Enterprise Ready</span>
            </div>
          </div>

          {/* Settings Preview */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Badge variant="secondary" className="px-3 py-1">
              {settings.difficulty}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {settings.numberOfQuestions} Questions
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {settings.timerMinutes} Min
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {getCategoryDisplayName(settings.category)}
            </Badge>
            {settings.liveMode && (
              <Badge variant="secondary" className="px-3 py-1">
                <Mic className="h-3 w-3 mr-1" />
                Live Mode
              </Badge>
            )}
          </div>

          {/* CTA Button */}
          <Button
            variant="cta"
            size="lg"
            onClick={handleStartInterview}
            disabled={isStarting}
            className="px-12 py-6 text-lg rounded-xl"
          >
            <Play className="h-6 w-6 mr-3" />
            {isStarting ? 'Starting Interview...' : 'Start Interview'}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive interview preparation with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Coding Challenges */}
            <Card className="group hover:shadow-lg transition-smooth border-border/50 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-primary text-white">
                    <Code className="h-8 w-8" />
                  </div>
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Coding Challenges</CardTitle>
                <CardDescription className="leading-relaxed">
                  Practice with real interview problems using our advanced Monaco editor. 
                  Get instant feedback on your solutions with detailed explanations.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Live Voice Mode */}
            <Card className="group hover:shadow-lg transition-smooth border-border/50 hover:border-accent/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-accent text-white">
                    <Mic className="h-8 w-8" />
                  </div>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Live Voice Mode</CardTitle>
                <CardDescription className="leading-relaxed">
                  Experience realistic interviews with voice interaction. 
                  Practice speaking through your solutions just like in real interviews.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* AI Feedback */}
            <Card className="group hover:shadow-lg transition-smooth border-border/50 hover:border-success/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-success text-white">
                    <Brain className="h-8 w-8" />
                  </div>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">AI Feedback</CardTitle>
                <CardDescription className="leading-relaxed">
                  Get personalized insights on your performance, code quality, and communication skills 
                  to improve for your next interview.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose InterviewAI?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Real Interview Experience</h3>
                    <p className="text-muted-foreground">Practice in an environment that mirrors actual technical interviews</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Instant AI Feedback</h3>
                    <p className="text-muted-foreground">Get detailed analysis of your solutions and communication style</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Multiple Categories</h3>
                    <p className="text-muted-foreground">From frontend to AI/ML, practice questions across all tech domains</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Voice & Text Modes</h3>
                    <p className="text-muted-foreground">Choose between typing or speaking your answers naturally</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:pl-8">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic text-foreground mb-4">
                    "InterviewAI helped me land my dream job at a top tech company. 
                    The AI feedback was incredibly insightful."
                  </blockquote>
                  <cite className="text-muted-foreground font-medium">
                    - Software Engineer at Google
                  </cite>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

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