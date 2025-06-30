import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-game-header',
  imports: [CommonModule],
  templateUrl: './game-header.component.html',
  styleUrl: './game-header.component.css'
})
export class GameHeaderComponent {
  @Input() targetAnimal: string = '';
  @Input() score: number = 0;

  constructor(
    private gameService: GameService,
    private audioService: AudioService
  ) {}

  getTargetAnimalEmoji(): string {
    return this.gameService.getTargetAnimalEmoji();
  }
  
  getTargetAnimalName(): string {
    return this.gameService.getTargetAnimalName();
  }

  getColorHex(colorName: string): string {
    return this.gameService.getColorHex(colorName);
  }

  toggleAudio(): void {
    const currentEnabled = this.audioService.isEnabled();
    this.audioService.setAudioEnabled(!currentEnabled);
    
    // Play a test sound if enabling
    if (!currentEnabled) {
      this.audioService.enableAudio().then(() => {
        this.audioService.playSuccessSound();
      });
    }
  }

  isAudioEnabled(): boolean {
    return this.audioService.isEnabled();
  }
}
