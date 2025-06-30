import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-header',
  imports: [CommonModule],
  templateUrl: './game-header.component.html',
  styleUrl: './game-header.component.css'
})
export class GameHeaderComponent {
  @Input() targetColor: string = '';
  @Input() score: number = 0;

  constructor(private gameService: GameService) {}

  getTargetColorEmoji(): string {
    return this.gameService.getTargetColorEmoji();
  }

  getColorHex(colorName: string): string {
    return this.gameService.getColorHex(colorName);
  }
}
