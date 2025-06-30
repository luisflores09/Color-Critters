import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-controls',
  imports: [CommonModule],
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.css'
})
export class GameControlsComponent {
  @Input() gameActive: boolean = false;
  @Input() celebrationMode: boolean = false;
  @Output() startGame = new EventEmitter<void>();

  onStartGame(): void {
    this.startGame.emit();
  }
}
