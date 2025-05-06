export interface QuizResult {
  traits: {
    [key: string]: number;
  };
  composites: {
    learningPotential: number;
    technicalAptitude: number;
    teamworkAbility: number;
  };
  learningStyle: string;
}

interface Option {
  text: string;
  value: number;
}

export interface QuizData {
  questions: {
    id: number;
    trait: string;
    question: string;
    options: Option[];
  }[];
}

export interface UserInfo {
  name: string;
  email: string;
  course: string;
} 