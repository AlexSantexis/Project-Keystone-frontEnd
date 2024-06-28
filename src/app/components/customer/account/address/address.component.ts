import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddressService } from '../../../../shared/services/AddressService';
import { Address } from '../../../../shared/models/address.mode';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { nameValidator } from '../../../../shared/validators/formValidators';
import { MessageComponent } from '../../../message/message-component.component';
import { MessageService } from '../../../../shared/services/MessageService';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MessageComponent],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  addressService = inject(AddressService);
  messageService = inject(MessageService);
  address: Address | undefined = undefined;
  router = inject(Router);
  form: FormGroup = new FormGroup({
    streetAddress: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required, nameValidator()]),
    zipcode: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]),
    country: new FormControl('', [Validators.required, nameValidator()]),
  });

  ngOnInit() {
    this.loadAddress();
  }

  loadAddress() {
    this.addressService
      .getAddress()
      .pipe(
        tap((address) => {
          this.address = address;
          this.form.patchValue(address);
        }),
        catchError((error) => {
          if (error.status !== 404) {
            console.error('Error loading address:', error);
            this.messageService.setMessage({
              type: 'error',
              text: 'Failed to load address. Please try again.',
            });
          }
          return of(null);
        })
      )
      .subscribe();
  }

  onSubmit() {
    if (this.form.valid) {
      const addressData: Address = this.form.value;
      const operation = this.address ? 'updateAddress' : 'addAddress';

      this.addressService[operation](addressData)
        .pipe(
          tap((response) => {
            console.log(
              `Address ${this.address ? 'updated' : 'added'} successfully`,
              response
            );
            this.messageService.setMessage({
              type: 'success',
              text: `Address ${
                this.address ? 'updated' : 'added'
              } successfully`,
            });
            this.router.navigate(['/customer/account']);
            this.loadAddress();
          }),
          catchError((error) => {
            console.error(
              `Error ${this.address ? 'updating' : 'adding'} address:`,
              error
            );
            this.messageService.setMessage({
              type: 'error',
              text:
                error.error.message ||
                `Failed to ${this.address ? 'update' : 'add'} address`,
            });
            return of(null);
          })
        )
        .subscribe();
    } else {
      this.messageService.setMessage({
        type: 'error',
        text: 'Please fill in all required fields correctly.',
      });
    }
  }

  get f() {
    return this.form.controls;
  }
}
