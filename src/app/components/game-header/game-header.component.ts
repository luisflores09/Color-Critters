import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
    private audioService: AudioService,
    private router: Router
  ) {}

  goHome(): void {
    // Navigate back to the main menu
    this.router.navigate(['/']);
  }

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
    
    // Always try to enable audio and speech on toggle
    this.audioService.enableAudio().then(() => {
      if (!currentEnabled) {
        // Test both sound and speech when enabling
        this.audioService.playSuccessSound();
        setTimeout(() => {
          this.audioService.speakAnimalName('test');
        }, 300);
      }
    });
  }

  isAudioEnabled(): boolean {
    return this.audioService.isEnabled();
  }
}
