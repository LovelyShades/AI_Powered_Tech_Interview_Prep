import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Question } from '@/lib/store/sessionStore';

export const useSecureQuestions = (sessionId: string | null, questionIds: string[]) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || questionIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth session for the request
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          throw new Error('Authentication required');
        }

        const fetchedQuestions: Question[] = [];

        // Fetch each question securely through the edge function
        for (const questionId of questionIds) {
          const { data, error } = await supabase.functions.invoke('get-question', {
            body: { questionId, sessionId },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          });

          if (error || !data?.question) {
            console.error(`Failed to fetch question ${questionId}:`, error);
            // Continue fetching other questions instead of failing completely
            continue;
          }

          fetchedQuestions.push({
            question_id: data.question.question_id.toString(),
            title: data.question.title,
            qtype: data.question.qtype,
            difficulty: data.question.difficulty,
            prompt: data.question.prompt,
            expected_answer: data.question.expected_answer,
            language: data.question.language,
            signature: data.question.signature,
            tests: data.question.tests
          });
        }

        setQuestions(fetchedQuestions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
        console.error('Error fetching questions:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sessionId, questionIds]);

  return { questions, loading, error };
};