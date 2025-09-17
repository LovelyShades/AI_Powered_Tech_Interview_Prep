import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Globe } from "lucide-react";

interface Language {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const languages: Language[] = [
  { id: "javascript", name: "JavaScript", icon: <Code className="h-3 w-3" />, color: "bg-yellow-500" },
  { id: "python", name: "Python", icon: <Code className="h-3 w-3" />, color: "bg-blue-500" },
  { id: "java", name: "Java", icon: <Code className="h-3 w-3" />, color: "bg-orange-500" },
  { id: "cpp", name: "C++", icon: <Code className="h-3 w-3" />, color: "bg-purple-500" },
  { id: "typescript", name: "TypeScript", icon: <Code className="h-3 w-3" />, color: "bg-blue-600" },
  { id: "go", name: "Go", icon: <Code className="h-3 w-3" />, color: "bg-cyan-500" },
  { id: "rust", name: "Rust", icon: <Code className="h-3 w-3" />, color: "bg-orange-600" },
  { id: "sql", name: "SQL", icon: <Database className="h-3 w-3" />, color: "bg-green-500" },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

export const LanguageSelector = ({ 
  currentLanguage, 
  onLanguageChange, 
  disabled = false 
}: LanguageSelectorProps) => {
  const selectedLanguage = languages.find(lang => lang.id === currentLanguage) || languages[0];

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 text-xs font-medium"
        >
          {selectedLanguage.icon}
          <span>{selectedLanguage.name}</span>
        </Badge>
      </div>
      
      <Select
        value={currentLanguage}
        onValueChange={onLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Change language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.id} value={language.id}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${language.color}`} />
                {language.icon}
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};