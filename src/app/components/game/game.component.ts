import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { GameService } from '../../services/game.service';
import { GameState, Critter } from '../../models/critter.model';
import { GameHeaderComponent } from '../game-header/game-header.component';
import { CritterComponent } from '../critter/critter.component';
import { CelebrationComponent } from '../celebration/celebration.component';
import { GameControlsComponent } from '../game-controls/game-controls.component';

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
    GameHeaderComponent,
    CritterComponent,
    CelebrationComponent,
    GameControlsComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  gameState$: Observable<GameState>;

  constructor(private gameService: GameService) {
    this.gameState$ = this.gameService.gameState$;
  }

  ngOnInit(): void {
    this.gameService.startGame();
  }

  ngOnDestroy(): void {
    this.gameService.stopGame();
  }

  onCritterTap(critterId: number): void {
    this.gameService.onCritterTap(critterId);
  }

  onStartGame(): void {
    this.gameService.startGame();
  }

  trackByCritterId(index: number, critter: Critter): number {
    return critter.id;
  }
}
