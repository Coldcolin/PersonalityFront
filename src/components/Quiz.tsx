import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/Quiz.css';
import type { QuizResult } from '../types';

interface Option {
  text: string;
  value: number;
}

interface Question {
  id: number;
  trait: string;
  question: string;
  options: Option[];
}

interface QuizData {
  questions: Question[];
}

interface QuizProps {
  userInfo: { name: string; email: string; course: string };
  onQuizLoaded: (data: QuizData) => void;
  onComplete: (result: QuizResult) => void;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Quiz({ userInfo, onQuizLoaded, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = localStorage.getItem('quiz_current_question');
    return saved ? parseInt(saved) : 0;
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<Option[][]>([]);
  const [optionValues, setOptionValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timer: persist using localStorage
  const getInitialTimer = () => {
    const saved = localStorage.getItem('quiz_timer');
    if (saved) {
      const { value, timestamp } = JSON.parse(saved);
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - timestamp;
      return Math.max(value - elapsed, 0);
    }
    return 600; // 10 minutes in seconds
  };

  const [timer, setTimer] = useState(getInitialTimer());

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save current question and answers to localStorage
  useEffect(() => {
    localStorage.setItem('quiz_current_question', currentQuestion.toString());
    localStorage.setItem('quiz_answers', JSON.stringify(optionValues));
  }, [currentQuestion, optionValues]);

  // Save timer to localStorage on change
  useEffect(() => {
    if (timer > 0) {
      localStorage.setItem('quiz_timer', JSON.stringify({
        value: timer,
        timestamp: Math.floor(Date.now() / 1000)
      }));
    } else {
      localStorage.removeItem('quiz_timer');
    }
  }, [timer]);

  // Timer countdown logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          if (newTimer === 0) {
            submitAnswers(optionValues);
          }
          return newTimer;
        });
      }, 1000);
    } else {
      submitAnswers(optionValues);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [timer > 0, optionValues]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get<Question[]>(`quiz/questions/${userInfo.course}`);
        
        // Shuffle options for each question
        const shuffled = data.map(q => ({
          ...q,
          shuffledOptions: shuffleArray(q.options)
        }));
        
        setQuestions(data);
        setShuffledOptions(shuffled.map(q => q.shuffledOptions));
        setOptionValues(new Array(data.length).fill(-1));
        onQuizLoaded({ questions: data });
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [userInfo.course, onQuizLoaded]);

  const handleAnswer = (selectedOption: Option) => {
    const newValues = [...optionValues];
    newValues[currentQuestion] = selectedOption.value;
    setOptionValues(newValues);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers(newValues);
    }
  };

  const submitAnswers = async (finalValues: number[]) => {
    try {
      const { data } = await api.post<{ result: QuizResult }>('quiz/submit', {
        answers: finalValues,
        course: userInfo.course,
        name: userInfo.name,
        email: userInfo.email
      });
      
      // Clear localStorage after successful submission
      localStorage.removeItem('quiz_timer');
      localStorage.removeItem('quiz_current_question');
      localStorage.removeItem('quiz_answers');
      onComplete(data.result);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!questions.length) return <div>No questions found.</div>;

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="timer">{formatTime(timer)}</div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
        <div className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
      <div className="question">
        {questions[currentQuestion].question}
      </div>
      <div className="options">
        {shuffledOptions[currentQuestion]?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`option-button ${optionValues[currentQuestion] === option.value ? 'selected' : ''}`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
} 