import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Critter, GameColor, GameAnimal, GameState } from '../models/critter.model';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    critters: [],
    targetAnimal: '',
    score: 0,
    gameActive: false,
    celebrationMode: false
  });

  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  // Game configuration
  public readonly animals: GameAnimal[] = [
    { name: 'dog', emoji: '🐶', soundName: 'woof' },
    { name: 'cat', emoji: '🐱', soundName: 'meow' },
    { name: 'rabbit', emoji: '🐰', soundName: 'hop' },
    { name: 'fox', emoji: '🦊', soundName: 'bark' },
    { name: 'frog', emoji: '🐸', soundName: 'ribbit' },
    { name: 'penguin', emoji: '🐧', soundName: 'squeak' },
    { name: 'butterfly', emoji: '🦋', soundName: 'flutter' },
    { name: 'bee', emoji: '🐝', soundName: 'buzz' },
    { name: 'turtle', emoji: '🐢', soundName: 'slow' },
    { name: 'duck', emoji: '🦆', soundName: 'quack' }
  ];
  
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

  constructor(private audioService: AudioService) { }

  startGame(): void {
    this.clearIntervals();
    
    // Enable audio on first user interaction
    this.audioService.enableAudio();
    
    const newState: GameState = {
      gameActive: true,
      score: 0,
      critters: [],
      targetAnimal: '',
      celebrationMode: false
    };

    this.updateGameState(newState);
    this.setNewTargetAnimal();
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

      // Play sound and speak animal name
      this.playSuccessSound();
      this.speakTappedAnimal(critter.animal);

      // Check for celebration milestone
      if (newScore % 10 === 0) {
        this.triggerCelebration();
      }

      // Change target animal every 3 correct answers
      if (newScore % 3 === 0) {
        setTimeout(() => this.setNewTargetAnimal(), 1000);
      }
    } else {
      this.updateGameState({
        ...currentState,
        critters: updatedCritters
      });
      this.playEncouragementSound();
      this.speakTappedAnimal(critter.animal);
    }

    // Remove critter after animation
    setTimeout(() => {
      this.removeCritter(critterId);
    }, 600);
  }

  getColorByName(colorName: string): GameColor | undefined {
    return this.colors.find(c => c.name === colorName);
  }
  
  getAnimalByName(animalName: string): GameAnimal | undefined {
    return this.animals.find(a => a.name === animalName);
  }
  
  getAnimalByEmoji(emoji: string): GameAnimal | undefined {
    return this.animals.find(a => a.emoji === emoji);
  }

  getColorHex(colorName: string): string {
    return this.getColorByName(colorName)?.hex || '#000';
  }

  getTargetAnimalEmoji(): string {
    const currentState = this.getCurrentState();
    return this.getAnimalByName(currentState.targetAnimal)?.emoji || '🐶';
  }
  
  getTargetAnimalName(): string {
    const currentState = this.getCurrentState();
    return this.getAnimalByName(currentState.targetAnimal)?.name || 'dogs';
  }

  private getCurrentState(): GameState {
    return this.gameStateSubject.value;
  }

  private updateGameState(newState: GameState): void {
    this.gameStateSubject.next(newState);
  }

  private setNewTargetAnimal(): void {
    const randomAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const currentState = this.getCurrentState();
    
    // Update all existing critters' isCorrect property based on new target
    const updatedCritters = currentState.critters.map(critter => {
      const critterAnimal = this.getAnimalByEmoji(critter.animal);
      return {
        ...critter,
        isCorrect: critterAnimal ? critterAnimal.name === randomAnimal.name : false
      };
    });
    
    this.updateGameState({
      ...currentState,
      targetAnimal: randomAnimal.name,
      critters: updatedCritters
    });
    
    this.playAnimalAnnouncement();
  }

  private spawnCritter(): void {
    const currentState = this.getCurrentState();
    if (!currentState.gameActive || currentState.celebrationMode) return;

    const randomAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const isCorrect = randomAnimal.name === currentState.targetAnimal;

    // Ensure at least 40% chance of correct animal
    const targetAnimalObj = this.getAnimalByName(currentState.targetAnimal);
    const finalAnimal = Math.random() < 0.4 && targetAnimalObj ? targetAnimalObj : randomAnimal;

    const newCritter: Critter = {
      id: Date.now() + Math.random(),
      animal: finalAnimal.emoji,
      color: randomColor.name,
      x: Math.random() * 80 + 5, // 5% to 85% of screen width
      y: Math.random() * 70 + 15, // 15% to 85% of screen height
      isCorrect: finalAnimal.name === currentState.targetAnimal,
      isAnimating: false
    };

    this.updateGameState({
      ...currentState,
      critters: [...currentState.critters, newCritter]
    });

    // Play a subtle spawn sound
    this.audioService.playCritterSpawnSound();
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

  // Audio methods - now using AudioService
  private playAnimalAnnouncement(): void {
    const currentState = this.getCurrentState();
    const targetAnimal = this.getAnimalByName(currentState.targetAnimal);
    
    if (targetAnimal) {
      // Play both sound and speech
      this.audioService.playColorAnnouncement(); // Attention sound
      setTimeout(() => {
        this.audioService.speakTargetAnimal(targetAnimal.name);
      }, 500); // Small delay after attention sound
    }
  }

  private playSuccessSound(): void {
    this.audioService.playSuccessSound();
  }

  private playEncouragementSound(): void {
    this.audioService.playEncouragementSound();
  }

  private playVictorySound(): void {
    this.audioService.playVictorySound();
  }

  private speakTappedAnimal(animalEmoji: string): void {
    // Find the animal by emoji and speak its name
    const animal = this.getAnimalByEmoji(animalEmoji);
    if (animal) {
      this.audioService.speakAnimalName(animal.name);
    }
  }
}
