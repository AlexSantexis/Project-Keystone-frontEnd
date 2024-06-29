import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message, MessageService } from '../../shared/services/MessageService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-component.component.html',
  styleUrl: './message-component.component.css',
})
export class MessageComponent {
  message: Message | null = null;
  subscription: Subscription | null = null;
  messageService = inject(MessageService);
}
