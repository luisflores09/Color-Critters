import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private isAudioEnabled = true;
  private speechSynthesis: SpeechSynthesis | null = null;
  private speechEnabled = false; // Track if speech was enabled by user interaction
  private initializationAttempts = 0;
  private maxInitializationAttempts = 5;

  constructor() {
    this.initializeAudio();
    this.initializeSpeech();
  }

  private initializeAudio(): void {
    try {
      // Create AudioContext with user interaction support
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.isAudioEnabled = false;
    }
  }

  private initializeSpeech(): void {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      
      // Load voices (some browsers need this)
      if (this.speechSynthesis.getVoices().length === 0) {
        this.speechSynthesis.addEventListener('voiceschanged', () => {
          // Voices are now loaded
        });
      }
    } else {
      console.warn('Speech synthesis not supported');
    }
  }

  // Enable audio after user interaction (required by browsers)
  async enableAudio(): Promise<void> {
    this.initializationAttempts++;
    console.log(`Audio initialization attempt ${this.initializationAttempts}`);
    
    // Always try to resume audio context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        this.isAudioEnabled = true;
        console.log('Audio context resumed');
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    }
    
    // Try to enable speech synthesis (attempt multiple times if needed)
    if (this.speechSynthesis && !this.speechEnabled) {
      await this.initializeSpeechSynthesis();
    }
    
    // Force another attempt if speech still not enabled and we haven't exceeded max attempts
    if (!this.speechEnabled && this.initializationAttempts < this.maxInitializationAttempts) {
      console.log('Speech not enabled yet, will retry on next interaction');
    }
  }

  private async initializeSpeechSynthesis(): Promise<void> {
    if (!this.speechSynthesis) return;
    
    try {
      // Wait for voices to load if they haven't yet
      await this.waitForVoices();
      
      // Test speech synthesis multiple times for reliability
      for (let i = 0; i < 3; i++) {
        const testUtterance = new SpeechSynthesisUtterance('test');
        testUtterance.volume = 0; // Silent test
        testUtterance.rate = 2; // Fast to minimize delay
        this.speechSynthesis.speak(testUtterance);
        this.speechSynthesis.cancel(); // Cancel immediately
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      this.speechEnabled = true;
      console.log('Speech synthesis enabled successfully');
    } catch (error) {
      console.warn('Could not enable speech synthesis:', error);
    }
  }

  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.speechSynthesis) {
        resolve();
        return;
      }
      
      const voices = this.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log(`Found ${voices.length} voices`);
        resolve();
      } else {
        console.log('Waiting for voices to load...');
        this.speechSynthesis.addEventListener('voiceschanged', () => {
          const newVoices = this.speechSynthesis!.getVoices();
          console.log(`Voices loaded: ${newVoices.length} available`);
          resolve();
        }, { once: true });
        
        // Fallback timeout
        setTimeout(() => {
          console.log('Voice loading timeout, proceeding anyway');
          resolve();
        }, 1000);
      }
    });
  }

  // Text-to-speech methods
  speakAnimalName(animalName: string): void {
    // Try to enable speech if not already enabled
    if (!this.speechEnabled) {
      console.log('Speech not enabled, attempting to enable...');
      this.enableAudio();
      // Try again after a short delay
      setTimeout(() => this.speakAnimalName(animalName), 200);
      return;
    }
    
    if (!this.isAudioEnabled || !this.speechSynthesis) {
      console.log('Audio or speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(animalName);
    utterance.rate = 0.8; // Slightly slower for children
    utterance.pitch = 1.2; // Slightly higher pitch for friendliness
    utterance.volume = 0.8;
    
    // Use a child-friendly voice if available
    const voices = this.speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('child') || 
      voice.name.toLowerCase().includes('kids') ||
      voice.name.toLowerCase().includes('female')
    );
    
    if (childVoice) {
      utterance.voice = childVoice;
    }

    console.log('Speaking:', animalName);
    this.speechSynthesis.speak(utterance);
  }

  speakTargetAnimal(animalName: string): void {
    // Try to enable speech if not already enabled
    if (!this.speechEnabled) {
      console.log('Speech not enabled for target, attempting to enable...');
      this.enableAudio();
      // Try again after a short delay
      setTimeout(() => this.speakTargetAnimal(animalName), 200);
      return;
    }
    
    if (!this.isAudioEnabled || !this.speechSynthesis) {
      console.log('Audio or speech synthesis not available for target');
      return;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const message = `Find the ${animalName}s!`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.7; // Slower for instructions
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    
    // Use a child-friendly voice if available
    const voices = this.speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('child') || 
      voice.name.toLowerCase().includes('kids') ||
      voice.name.toLowerCase().includes('female')
    );
    
    if (childVoice) {
      utterance.voice = childVoice;
    }

    console.log('Speaking target:', message);
    this.speechSynthesis.speak(utterance);
  }

  // Play success sound - cheerful ascending notes
  playSuccessSound(): void {
    if (!this.isAudioEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Create a happy ascending melody
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    let time = now;

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.setValueAtTime(freq, time);
      osc.type = 'triangle'; // Softer, more pleasant sound
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.start(time);
      osc.stop(time + 0.2);
      
      time += 0.1;
    });
  }

  // Play encouragement sound - gentle, not discouraging
  playEncouragementSound(): void {
    if (!this.isAudioEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Gentle, encouraging sound - not harsh
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.frequency.exponentialRampToValueAtTime(349.23, now + 0.3); // F4
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  // Play victory sound - celebratory fanfare
  playVictorySound(): void {
    if (!this.isAudioEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Create a fanfare with multiple notes
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.15 }, // E5
      { freq: 783.99, time: 0.3 },  // G5
      { freq: 1046.5, time: 0.45 }, // C6
      { freq: 783.99, time: 0.6 },  // G5
      { freq: 1046.5, time: 0.75 }  // C6
    ];

    melody.forEach(note => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.setValueAtTime(note.freq, now + note.time);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.15, now + note.time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.25);
      
      osc.start(now + note.time);
      osc.stop(now + note.time + 0.25);
    });
  }

  // Play color announcement sound - attention getting
  playColorAnnouncement(): void {
    if (!this.isAudioEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Two-tone chime to get attention
    [440, 554.37].forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.frequency.setValueAtTime(freq, now + index * 0.2);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0, now + index * 0.2);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.2 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.2 + 0.3);
      
      osc.start(now + index * 0.2);
      osc.stop(now + index * 0.2 + 0.3);
    });
  }

  // Play critter spawn sound - playful pop
  playCritterSpawnSound(): void {
    if (!this.isAudioEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    // Quick "pop" sound
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Enable/disable audio
  setAudioEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
  }

  isEnabled(): boolean {
    return this.isAudioEnabled;
  }
}
