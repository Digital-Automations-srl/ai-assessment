export interface QuizOption {
  letter: string;
  text: string;
  score: number;
  isNonSo?: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface ContextQuestion {
  id: string;
  text: string;
  options: string[];
}

export type AxisKey =
  | "conformita"
  | "processi"
  | "utilizzo"
  | "autonomia"
  | "protezione"
  | "tecnologia";

export interface Axis {
  key: AxisKey;
  label: string;
  formal: string;
  questions: QuizQuestion[];
}

export interface AxisResult {
  key: AxisKey;
  label: string;
  formal: string;
  score: number;
  levelLabel: string;
  levelColor: string;
}

export interface ComplianceArea {
  name: string;
  reference: string;
  getScore: (answers: Record<string, number>) => number;
  messages: { red: string; yellow: string; green: string };
  action: string;
}

export interface QuizResults {
  contextAnswers: Record<string, string>;
  axisResults: AxisResult[];
  overallScore: number;
  overallLabel: string;
  overallColor: string;
  overallMessage: string;
  compliance: ComplianceResult[];
}

export interface ComplianceResult {
  name: string;
  reference: string;
  score: number;
  color: "red" | "yellow" | "green";
  message: string;
  action: string;
}

export interface LeadData {
  nome: string;
  cognome: string;
  email: string;
  azienda: string;
  telefono: string;
  referral: string;
  consenso: boolean;
  consensoMarketing: boolean;
}
