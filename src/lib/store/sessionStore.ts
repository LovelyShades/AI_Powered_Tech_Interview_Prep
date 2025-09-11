import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  question_id: string;
  title: string;
  qtype: 'Coding' | 'Behavioral' | 'Theory' | 'System Design' | 'Technical';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  expected_answer?: string;
  language?: string;
  signature?: string;
  tests?: any;
}

export interface Answer {
  rawText?: string;
  code?: string;
  testResults?: {
    passed: number;
    total: number;
    details: any[];
  };
  score?: number;
  quickFeedback?: string;
  finalFeedback?: string;
  solutionSnapshot?: string;
  submittedAt?: string;
}

export interface SessionSettings {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numberOfQuestions: number;
  timerMinutes: number;
  quickFeedback: boolean;
  liveMode: boolean;
  category: string;
  questionSource: 'curated' | 'leetcode-style';
}

interface SessionState {
  sessionId: string | null;
  questions: Question[];
  currentIndex: number;
  answersByQuestionId: Record<string, Answer>;
  settings: SessionSettings;
  timeStarted: number | null;
  
  // Actions
  setSession: (sessionId: string, questions: Question[], settings: SessionSettings) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  updateAnswer: (questionId: string, answer: Partial<Answer>) => void;
  submitAnswer: (questionId: string, answer: Answer) => Promise<void>;
  startTimer: () => void;
  reset: () => void;
  clearSession: () => void;
}

const defaultSettings: SessionSettings = {
  difficulty: 'Easy',
  numberOfQuestions: 10,
  timerMinutes: 10,
  quickFeedback: true,
  liveMode: false,
  category: 'Software Engineering',
  questionSource: 'curated'
};

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  questions: [],
  currentIndex: 0,
  answersByQuestionId: {},
  settings: defaultSettings,
  timeStarted: null,

  setSession: (sessionId, questions, settings) => set({
    sessionId,
    questions,
    settings,
    currentIndex: 0,
    answersByQuestionId: {}
  }),

  setQuestions: (questions: Question[]) => set({ questions }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  updateAnswer: (questionId, answer) => set((state) => ({
    answersByQuestionId: {
      ...state.answersByQuestionId,
      [questionId]: {
        ...state.answersByQuestionId[questionId],
        ...answer
      }
    }
  })),

  submitAnswer: async (questionId, answer) => {
    const state = get();
    if (!state.sessionId) return;

    try {
      // Submit to Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('answers')
          .upsert({
            session_id: state.sessionId,
            question_id: questionId,
            idx: state.currentIndex,
            raw_text: answer.rawText,
            code: answer.code,
            test_results: answer.testResults,
            quick_feedback: answer.quickFeedback,
            final_feedback: answer.finalFeedback,
            solution_snapshot: answer.solutionSnapshot,
            score: answer.score,
            submitted_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error submitting answer:', error);
        }
      }

      // Update local state
      set((state) => ({
        answersByQuestionId: {
          ...state.answersByQuestionId,
          [questionId]: {
            ...answer,
            submittedAt: new Date().toISOString()
          }
        }
      }));
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  },

  startTimer: () => set({ timeStarted: Date.now() }),

  reset: () => set({
    sessionId: null,
    questions: [],
    currentIndex: 0,
    answersByQuestionId: {},
    timeStarted: null
  }),

  // Clear session data completely including localStorage
  clearSession: () => {
    localStorage.removeItem('currentSessionQuestions');
    set({
      sessionId: null,
      questions: [],
      currentIndex: 0,
      answersByQuestionId: {},
      timeStarted: null
    });
  }
}));