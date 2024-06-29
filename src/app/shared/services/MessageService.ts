// MessageService.ts
import { Injectable, signal } from '@angular/core';

export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageSignal = signal<Message | null>(null);

  setMessage(message: Message): void {
    this.messageSignal.set(message);
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage(): void {
    this.messageSignal.set(null);
  }

  getMessage() {
    return this.messageSignal.asReadonly();
  }
}
