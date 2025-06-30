import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css'
})
export class MainMenuComponent {
  
  constructor(
    private router: Router,
    private audioService: AudioService
  ) {}

  playColorCritters(): void {
    // Initialize audio on click to resolve mobile audio restrictions
    // This user interaction enables audio for the subsequent game
    this.audioService.enableAudio().then(() => {
      console.log('Audio enabled from main menu interaction');
      // Navigate to the Color Critters game
      this.router.navigate(['/color-critters']);
    }).catch((error) => {
      console.log('Audio initialization failed, but proceeding to game:', error);
      // Still navigate to the game even if audio fails
      this.router.navigate(['/color-critters']);
    });
  }
}
