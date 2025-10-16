import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  elo: number;
  totalWins: number;
  totalLoss: number;
  totalDraws: number;
  currentStreak: number;
  bestStreak: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

