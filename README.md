# 🎮 Color Critters - A Fun Game for Kids

A delightful Angular-based game designed for young children to learn colors while having fun with cute animated animals!

## 🎯 Game Features

- **Color Recognition**: Tap critters of the target color shown at the top
- **Cute Animals**: 10 different animal emojis that bounce and animate
- **Celebration Mode**: Special animations every 5 correct taps
- **Mobile-Friendly**: Optimized for touch devices and iPhones
- **Progressive Difficulty**: Target color changes every 3 correct answers

## 🏗️ Project Structure

```
src/app/
├── components/
│   ├── game/                    # Main game orchestrator
│   ├── game-header/             # Target color display and score
│   ├── critter/                 # Individual animated critter
│   ├── celebration/             # Celebration overlay with confetti
│   └── game-controls/           # Start/Reset game button
├── models/
│   └── critter.model.ts         # Game interfaces and types
├── services/
│   └── game.service.ts          # Game logic and state management
└── app.component.ts             # Root component
```

## 🔧 Component Architecture

### GameService
- **Centralized State Management**: Uses RxJS BehaviorSubject for reactive state
- **Game Logic**: Handles critter spawning, scoring, and celebrations
- **Configuration**: Manages colors, animals, and game rules

### GameComponent
- **Main Orchestrator**: Subscribes to game state and coordinates child components
- **Event Handling**: Manages critter taps and game controls

### Individual Components
- **GameHeaderComponent**: Displays target color and current score
- **CritterComponent**: Reusable component for each animated critter
- **CelebrationComponent**: Handles celebration animations and confetti
- **GameControlsComponent**: Start/Reset game functionality

## 🎨 Styling Architecture

Each component has its own CSS file with:
- **Scoped Styles**: Component-specific animations and layouts
- **Mobile Responsive**: Optimized for different screen sizes
- **Touch-Friendly**: Large tap targets for young children
- **Smooth Animations**: CSS keyframes for engaging visual effects

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
