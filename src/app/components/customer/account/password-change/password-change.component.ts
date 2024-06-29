import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../shared/services/UserService';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from '../../../../shared/services/MessageService';
import { PasswordChangeModel } from '../../../../shared/models/user';
import { MessageComponent } from '../../../message/message-component.component';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MessageComponent],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.css',
})
export class PasswordChangeComponent {
  router = inject(Router);
  userService = inject(UserService);
  messageService = inject(MessageService);

  form: FormGroup = new FormGroup({
    currentPassword: new FormControl(null, [Validators.required]),
    newPassword: new FormControl(null, [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.messageService.setMessage({
        type: 'error',
        text: 'Please fill in all required fields correctly. Passwords must be at least 8 characters long.',
      });
      return;
    }

    const passwordChangeModel: PasswordChangeModel = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    this.userService.changePassword(passwordChangeModel).subscribe({
      next: (response) => {
        this.messageService.setMessage({
          type: 'success',
          text: response.message || 'Password changed successfully',
        });
        this.form.reset();
        this.router.navigate(['/customer/account']);
      },
      error: (response) => {
        if (response.status === 404) {
          this.messageService.setMessage({
            type: 'error',
            text: response.error.message || 'User not found',
          });
        } else if (response.status === 400) {
          if (response.error.errors) {
            const errorMessages = Object.values(response.error.errors).flat();
            this.messageService.setMessage({
              type: 'error',
              text: errorMessages.join(', '),
            });
          } else {
            this.messageService.setMessage({
              type: 'error',
              text: response.error.message || 'Failed to change password',
            });
          }
        } else if (response.status === 401) {
          this.messageService.setMessage({
            type: 'error',
            text: 'You are not authorized to perform this action. Please log in again.',
          });
        } else {
          this.messageService.setMessage({
            type: 'error',
            text: 'An unexpected error occurred. Please try again later.',
          });
        }
      },
    });
  }
}
