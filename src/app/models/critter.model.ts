export interface Critter {
  id: number;
  animal: string;
  color: string;
  x: number;
  y: number;
  isCorrect: boolean;
  isAnimating: boolean;
}

export interface GameColor {
  name: string;
  hex: string;
  emoji: string;
}

export interface GameState {
  critters: Critter[];
  targetColor: string;
  score: number;
  gameActive: boolean;
  celebrationMode: boolean;
}
