import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Quiz from '../components/Quiz';
import type { QuizResult, QuizData } from '../types';

export default function QuizPage() {
  const navigate = useNavigate();
  const [userInfo] = useState(() => {
    const storedUserInfo = localStorage.getItem('quiz_user_info');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  console.log('quizData:', quizData);

  useEffect(() => {
    // If no user info is found, redirect to the form
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const handleQuizComplete = (result: QuizResult) => {
    // Clear quiz-related data from localStorage
    localStorage.removeItem('quiz_timer');
    localStorage.removeItem('quiz_current_question');
    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('quiz_user_info');
    
    // Store result temporarily and navigate to results
    localStorage.setItem('quiz_result', JSON.stringify(result));
    navigate('/results');
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="quiz-page">
      <Quiz
        userInfo={userInfo}
        onComplete={handleQuizComplete}
        onQuizLoaded={setQuizData}
      />
    </div>
  );
} 