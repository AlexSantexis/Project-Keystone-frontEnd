import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageSubject = new BehaviorSubject<Message | null>(null);

  setMessage(message: Message): void {
    this.messageSubject.next(message);
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }

  getMessage(): Observable<Message | null> {
    return this.messageSubject.asObservable();
  }
}
