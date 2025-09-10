import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface InterviewSettings {
  difficulty: "Easy" | "Medium" | "Hard";
  numberOfQuestions: number;
  timerMinutes: number;
  quickFeedback: boolean;
  category: "software_engineering" | "frontend_ui" | "ai_ml" | "cloud_devops" | "database_data" | "it_systems" | "security_cyber";
  questionSource: "curated" | "leetcode-style";
  liveMode: boolean;
}

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: InterviewSettings;
  onSettingsChange: (settings: InterviewSettings) => void;
  onStartInterview: () => void;
}

export const SettingsSheet = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onStartInterview
}: SettingsSheetProps) => {
  const updateSetting = <K extends keyof InterviewSettings>(
    key: K,
    value: InterviewSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleStartInterview = () => {
    onStartInterview();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Interview Settings</SheetTitle>
          <SheetDescription>
            Customize your interview experience. All changes are saved automatically.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-6">
          {/* Difficulty */}
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: "Easy" | "Medium" | "Hard") => 
                updateSetting("difficulty", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Questions */}
          <div className="grid gap-2">
            <Label htmlFor="questions">Number of Questions</Label>
            <Input
              id="questions"
              type="number"
              min="1"
              max="30"
              value={settings.numberOfQuestions}
              onChange={(e) => updateSetting("numberOfQuestions", parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-muted-foreground">Min: 1, Max: 30</p>
          </div>

          {/* Timer */}
          <div className="grid gap-2">
            <Label htmlFor="timer">Timer (minutes)</Label>
            <Input
              id="timer"
              type="number"
              min="1"
              value={settings.timerMinutes}
              onChange={(e) => updateSetting("timerMinutes", parseInt(e.target.value) || 1)}
            />
          </div>

          <Separator />

          {/* Quick Feedback */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quick Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Show feedback and solutions immediately after each question
              </p>
            </div>
            <Switch
              checked={settings.quickFeedback}
              onCheckedChange={(checked) => updateSetting("quickFeedback", checked)}
            />
          </div>

          {/* Live Interview Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Interview Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use voice input and AI conversation instead of text
              </p>
            </div>
            <Switch
              checked={settings.liveMode}
              onCheckedChange={(checked) => updateSetting("liveMode", checked)}
            />
          </div>

          <Separator />

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={settings.category}
              onValueChange={(value: "software_engineering" | "frontend_ui" | "ai_ml" | "cloud_devops" | "database_data" | "it_systems" | "security_cyber") => 
                updateSetting("category", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software_engineering">Software Engineering / Full-Stack Dev</SelectItem>
                <SelectItem value="frontend_ui">Frontend Development / UI</SelectItem>
                <SelectItem value="ai_ml">AI / Machine Learning</SelectItem>
                <SelectItem value="cloud_devops">Cloud & DevOps</SelectItem>
                <SelectItem value="database_data">Database / Data Engineering</SelectItem>
                <SelectItem value="it_systems">IT / Systems / Support</SelectItem>
                <SelectItem value="security_cyber">Security / Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Source */}
          <div className="grid gap-2">
            <Label htmlFor="source">Question Source</Label>
            <Select
              value={settings.questionSource}
              onValueChange={(value: "curated" | "leetcode-style") => 
                updateSetting("questionSource", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curated">
                  <div>
                    <div className="font-medium">Curated</div>
                    <div className="text-xs text-muted-foreground">Mix of coding, behavioral, and technical questions</div>
                  </div>
                </SelectItem>
                <SelectItem value="leetcode-style">
                  <div>
                    <div className="font-medium">LeetCode-style</div>
                    <div className="text-xs text-muted-foreground">Only coding algorithm problems</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {settings.questionSource === 'leetcode-style' 
                ? 'Only coding questions with algorithmic challenges will be shown'
                : 'A balanced mix of different question types including coding, behavioral, and technical questions'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Save & Close
          </Button>
          <Button onClick={handleStartInterview} variant="default" className="flex-1">
            Start Interview
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};