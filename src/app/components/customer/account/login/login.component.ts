import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../shared/services/UserService';
import {
  Credentials,
  LoggedInUser,
  TokenModel,
} from '../../../../shared/models/user';
import { jwtDecode } from 'jwt-decode';
import { MessageComponent } from '../../../message/message-component.component';
import { MessageService } from '../../../../shared/services/MessageService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MessageComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  userService = inject(UserService);
  router = inject(Router);
  messageService = inject(MessageService);
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  onSubmit() {
    const credentials = this.form.value as Credentials;
    console.log(credentials);
    this.userService.loginUser(credentials).subscribe({
      next: (response: TokenModel) => {
        console.log('Login Response', response);
        if (!response.accessToken || !response.refreshToken) {
          throw new Error(
            'Access token or refresh token is undefined or empty'
          );
        }
        this.userService.setTokens(response.accessToken, response.refreshToken);
        this.messageService.setMessage({
          type: 'success',
          text: 'Login successful',
        });
        if (this.userService.isAdmin()) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (response) => {
        console.error('Login error', response.error);
        let errorMessage = 'Login failed. Please try again.';

        if (response.error && response.error.message) {
          errorMessage = response.error.message;
        } else if (response.error && response.error.msg) {
          errorMessage = response.error.msg;
        }

        this.messageService.setMessage({ type: 'error', text: errorMessage });
        this.form.setErrors({ loginFailed: true });
      },
    });
  }
  get f() {
    return this.form.controls;
  }
}
