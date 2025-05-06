import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizResult } from './types';
import './styles/Results.css';

export default function Results() {
  const navigate = useNavigate();
  const [result] = useState<QuizResult | null>(() => {
    const storedResult = localStorage.getItem('quiz_result');
    return storedResult ? JSON.parse(storedResult) : null;
  });

  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  // Get the list of relevant traits from the questions for this quiz section
  const [relevantTraits, setRelevantTraits] = useState<string[] | null>(null);

  useEffect(() => {
    // Get the quiz questions from localStorage (set by QuizPage/Quiz)
    const quizDataRaw = localStorage.getItem('quiz_result');
    if (quizDataRaw) {
      try {
        // Try to get the traits from the user's quiz questions (if available)
        const quizQuestionsRaw = localStorage.getItem('quiz_user_questions');
        if (quizQuestionsRaw) {
          const quizQuestions = JSON.parse(quizQuestionsRaw);
          // Get unique traits from the questions
          const traits = Array.from(new Set(quizQuestions.map((q: { trait: string }) => q.trait)));
          setRelevantTraits(traits as string[]);
        } else if (result) {
          // Fallback: If no questions, show all traits in result
          setRelevantTraits(Object.keys(result.traits));
        }
      } catch (e) {
        setRelevantTraits(null);
      }
    }
    // Log relevantTraits whenever it changes
    if (relevantTraits) {
      console.log('Relevant Traits:', relevantTraits);
    }
  }, [result, relevantTraits]);

  const handleRestart = () => {
    localStorage.removeItem('quiz_result');
    navigate('/');
  };

  if (!result) {
    return null;
  }

  // Calculate average score across all traits
  const averageScore = Math.round(
    Object.values(result.traits).reduce((sum, score) => sum + score, 0) / Object.values(result.traits).length
  );

  return (
    <div className="results">
      <h2>Learning Assessment Results</h2>
      <div>
        <h3>Your Average Score</h3>
        <div className="average-score">{averageScore}%</div>
      </div>
      <button className="restart-button" onClick={handleRestart}>Home Page</button>
    </div>
  );
}
