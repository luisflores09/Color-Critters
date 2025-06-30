import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Critter, GameColor, GameState } from '../models/critter.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    critters: [],
    targetColor: '',
    score: 0,
    gameActive: false,
    celebrationMode: false
  });

  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  // Game configuration
  public readonly animals = ['🐶', '🐱', '🐰', '🦊', '🐸', '🐧', '🦋', '🐝', '🐢', '🦆'];
  public readonly colors: GameColor[] = [
    { name: 'red', hex: '#FF6B6B', emoji: '🔴' },
    { name: 'blue', hex: '#4ECDC4', emoji: '🔵' },
    { name: 'green', hex: '#45B7D1', emoji: '🟢' },
    { name: 'yellow', hex: '#F9E79F', emoji: '🟡' },
    { name: 'purple', hex: '#BB8FCE', emoji: '🟣' },
    { name: 'orange', hex: '#F8C471', emoji: '🟠' }
  ];

  private spawnInterval: any;
  private cleanupInterval: any;

  constructor() { }

  startGame(): void {
    this.clearIntervals();
    
    const newState: GameState = {
      gameActive: true,
      score: 0,
      critters: [],
      targetColor: '',
      celebrationMode: false
    };

    this.updateGameState(newState);
    this.setNewTargetColor();
    this.startGameIntervals();
  }

  stopGame(): void {
    this.clearIntervals();
    this.updateGameState({ 
      ...this.getCurrentState(), 
      gameActive: false 
    });
  }

  onCritterTap(critterId: number): void {
    const currentState = this.getCurrentState();
    const critter = currentState.critters.find(c => c.id === critterId);
    
    if (!critter || !currentState.gameActive || critter.isAnimating) return;

    // Mark critter as animating
    const updatedCritters = currentState.critters.map(c => 
      c.id === critterId ? { ...c, isAnimating: true } : c
    );

    if (critter.isCorrect) {
      const newScore = currentState.score + 1;
      this.updateGameState({
        ...currentState,
        score: newScore,
        critters: updatedCritters
      });

      this.playSuccessSound();

      // Check for celebration milestone
      if (newScore % 5 === 0) {
        this.triggerCelebration();
      }

      // Change target color every 3 correct answers
      if (newScore % 3 === 0) {
        setTimeout(() => this.setNewTargetColor(), 1000);
      }
    } else {
      this.updateGameState({
        ...currentState,
        critters: updatedCritters
      });
      this.playEncouragementSound();
    }

    // Remove critter after animation
    setTimeout(() => {
      this.removeCritter(critterId);
    }, 600);
  }

  getColorByName(colorName: string): GameColor | undefined {
    return this.colors.find(c => c.name === colorName);
  }

  getColorHex(colorName: string): string {
    return this.getColorByName(colorName)?.hex || '#000';
  }

  getTargetColorEmoji(): string {
    const currentState = this.getCurrentState();
    return this.getColorByName(currentState.targetColor)?.emoji || '⭕';
  }

  private getCurrentState(): GameState {
    return this.gameStateSubject.value;
  }

  private updateGameState(newState: GameState): void {
    this.gameStateSubject.next(newState);
  }

  private setNewTargetColor(): void {
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const currentState = this.getCurrentState();
    
    this.updateGameState({
      ...currentState,
      targetColor: randomColor.name
    });
    
    this.playColorAnnouncement();
  }

  private spawnCritter(): void {
    const currentState = this.getCurrentState();
    if (!currentState.gameActive || currentState.celebrationMode) return;

    const randomAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const isCorrect = randomColor.name === currentState.targetColor;

    // Ensure at least 30% chance of correct color
    const targetColorObj = this.getColorByName(currentState.targetColor);
    const finalColor = Math.random() < 0.7 && isCorrect ? randomColor : 
                      Math.random() < 0.3 && targetColorObj ? targetColorObj : randomColor;

    const newCritter: Critter = {
      id: Date.now() + Math.random(),
      animal: randomAnimal,
      color: finalColor.name,
      x: Math.random() * 80 + 5, // 5% to 85% of screen width
      y: Math.random() * 70 + 15, // 15% to 85% of screen height
      isCorrect: finalColor.name === currentState.targetColor,
      isAnimating: false
    };

    this.updateGameState({
      ...currentState,
      critters: [...currentState.critters, newCritter]
    });
  }

  private removeCritter(id: number): void {
    const currentState = this.getCurrentState();
    this.updateGameState({
      ...currentState,
      critters: currentState.critters.filter(c => c.id !== id)
    });
  }

  private cleanupCritters(): void {
    const currentState = this.getCurrentState();
    // Remove old critters that haven't been tapped
    if (currentState.critters.length > 8) {
      this.updateGameState({
        ...currentState,
        critters: currentState.critters.slice(-6)
      });
    }
  }

  private triggerCelebration(): void {
    const currentState = this.getCurrentState();
    this.updateGameState({
      ...currentState,
      celebrationMode: true
    });
    
    this.playVictorySound();

    setTimeout(() => {
      const state = this.getCurrentState();
      this.updateGameState({
        ...state,
        celebrationMode: false
      });
    }, 3000);
  }

  private startGameIntervals(): void {
    // Spawn critters every 2 seconds
    this.spawnInterval = setInterval(() => {
      this.spawnCritter();
    }, 2000);

    // Clean up old critters every 5 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupCritters();
    }, 5000);
  }

  private clearIntervals(): void {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Audio methods (placeholders for now)
  private playColorAnnouncement(): void {
    console.log(`New target color: ${this.getCurrentState().targetColor}`);
  }

  private playSuccessSound(): void {
    console.log('Success! 🎉');
  }

  private playEncouragementSound(): void {
    console.log('Try again! 😊');
  }

  private playVictorySound(): void {
    console.log('Celebration time! 🎊');
  }
}
