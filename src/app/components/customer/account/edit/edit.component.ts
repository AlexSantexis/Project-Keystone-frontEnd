import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  emailConfirmValidator,
  nameValidator,
} from '../../../../shared/validators/formValidators';
import { User } from '../../../../shared/models/user';
import { UserService } from '../../../../shared/services/UserService';
import { MessageService } from '../../../../shared/services/MessageService';
import { MessageComponent } from '../../../message/message-component.component';
@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MessageComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent {
  router = inject(Router);
  userService = inject(UserService);
  messageService = inject(MessageService);
  updateStatus: { success: boolean; message: string } = {
    success: false,
    message: 'Not attempted yet',
  };
  form: FormGroup = new FormGroup(
    {
      firstname: new FormControl(null, [Validators.required, nameValidator()]),
      lastname: new FormControl(null, [Validators.required, nameValidator()]),
      email: new FormControl('', [Validators.required, Validators.email]),
      confirmEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
    },
    { validators: emailConfirmValidator() }
  );

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.messageService.setMessage({
        type: 'error',
        text: 'Please fill in all required fields correctly.',
      });
      return;
    }
    const currentUser = this.userService.user();
    if (!currentUser) {
      this.messageService.setMessage({
        type: 'error',
        text: 'User not logged in',
      });
      return;
    }
    const user: User & { currentEmail: string } = {
      userId: currentUser.userId,
      firstname: this.form.value.firstname,
      lastname: this.form.value.lastname,
      email: this.form.value.email,
      currentEmail: currentUser.Email,
      password: '',
    };
    this.userService.updateUser(user).subscribe({
      next: (response) => {
        console.log('User updated successfully', response);
        if (response.token) {
          localStorage.setItem('access_token', response.token);
          this.userService.setUserFromToken(response.token);
        }
        this.messageService.setMessage({
          type: 'success',
          text: response.msg || 'User updated successfully',
        });
        this.router.navigate(['/customer/account']);
      },
      error: (error) => {
        console.error('Error updating user', error);
        if (error.status === 404) {
          this.messageService.setMessage({
            type: 'error',
            text: error.error.message || 'User not found',
          });
        } else if (error.status === 400) {
          if (error.error.errors) {
            // Handle validation errors
            const errorMessages = Object.values(error.error.errors).flat();
            this.messageService.setMessage({
              type: 'error',
              text: errorMessages.join(', '),
            });
          } else {
            this.messageService.setMessage({
              type: 'error',
              text: error.error.message || 'Failed to update user',
            });
          }
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
