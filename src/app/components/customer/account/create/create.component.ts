import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { User } from '../../../../shared/models/user';
import { UserService } from '../../../../shared/services/UserService';
import { inject } from '@angular/core';
import {
  createPasswordStrengthValidator,
  emailConfirmValidator,
  nameValidator,
  passwordConfirmValidator,
} from '../../../../shared/validators/formValidators';
@Component({
  selector: 'app-create',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent {
  router = inject(Router);
  userService = inject(UserService);
  registrationStatus: { success: boolean; message: string } = {
    success: false,
    message: 'Not attempted yet',
  };
  formSubmitted = false;

  form: FormGroup = new FormGroup(
    {
      firstname: new FormControl('', [Validators.required, nameValidator()]),
      lastname: new FormControl('', [Validators.required, nameValidator()]),
      email: new FormControl('', [Validators.required, Validators.email]),
      confirmEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    },
    {
      validators: [
        emailConfirmValidator(),
        passwordConfirmValidator(),
        createPasswordStrengthValidator(),
      ],
    }
  );

  onSubmit() {
    const user: User = {
      userId: '',
      firstname: this.form.value.firstname,
      lastname: this.form.value.lastname,
      email: this.form.value.email,
      password: this.form.value.password,
    };
    console.log(user);
    this.userService.registerUser(user).subscribe({
      next: (response) => {
        console.log(response.msg);
        this.registrationStatus = { success: true, message: response.msg };
        this.formSubmitted = true;
        this.router.navigate(['/account/login']);
      },
      error: (response) => {
        const message = response.error.msg;
        console.log('User registration error', message);
        this.registrationStatus = { success: false, message: response.msg };
      },
    });
  }
  get f() {
    return this.form.controls;
  }
}
