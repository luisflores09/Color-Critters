import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Critter } from '../../models/critter.model';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-critter',
  imports: [CommonModule],
  templateUrl: './critter.component.html',
  styleUrl: './critter.component.css'
})
export class CritterComponent {
  @Input() critter!: Critter;
  @Output() critterTapped = new EventEmitter<number>();

  constructor(private gameService: GameService) {}

  onTap(): void {
    this.critterTapped.emit(this.critter.id);
  }

  getColorHex(): string {
    return this.gameService.getColorHex(this.critter.color);
  }
}
