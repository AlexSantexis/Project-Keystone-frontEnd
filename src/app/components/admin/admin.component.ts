import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { UserService } from '../../shared/services/UserService';
import { UserDetailed } from '../../shared/models/user';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/ProductService';
import { nameValidator } from '../../shared/validators/formValidators';
import { AddressService } from '../../shared/services/AddressService';
import { Address } from '../../shared/models/address.mode';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  router = inject(Router);
  products: Product[] = [];
  displayedProducts: Product[] = [];
  users: UserDetailed[] = [];
  selectedUser: UserDetailed | null = null;
  selectedProduct: Product | null = null;
  currentPage = 1;
  pageSize = 20;
  totalProducts = 0;
  userService = inject(UserService);
  productService = inject(ProductService);
  addressService = inject(AddressService);

  isUpdateFormVisible = false;

  activeTab: 'userInfo' | 'address' | 'role' = 'userInfo';
  currentView: 'users' | 'products' = 'users';

  userInfoForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    roles: new FormControl([]),
  });

  productForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    price: new FormControl('', [Validators.required, Validators.min(0)]),
    imgUrl: new FormControl(''),
  });

  addressForm: FormGroup = new FormGroup({
    streetAddress: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    zipCode: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{5}$'),
    ]),
    country: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadProducts() {
    this.currentView = 'products';
    this.productService.getProductWithDetails(1, 40).subscribe({
      next: (products) => {
        this.products = products;
        this.updateDisplayedProducts();
        console.log('Products loaded successfully', products);
      },
      error: (error) => {
        console.error('Error loading products', error);
      },
    });
  }

  updateDisplayedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedProducts = this.products.slice(startIndex, endIndex);
  }

  loadUsers() {
    this.currentView = 'users';
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded successfully', users);
      },
      error: (error) => console.error('Error loading users', error),
    });
  }

  selectUser(user: UserDetailed) {
    this.selectedUser = { ...user };
    this.userInfoForm.patchValue({
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      roles: user.roles,
    });
    if (user.address) {
      this.addressForm.patchValue({
        streetAddress: user.address.streetAddress || 'N/A',
        city: user.address.city || 'N/A',
        zipCode: user.address.zipCode || 'N/A',
        country: user.address.country || 'N/A',
      });
    } else {
      this.addressForm.patchValue({
        streetAddress: 'N/A',
        city: 'N/A',
        zipCode: 'N/A',
        country: 'N/A',
      });
    }
  }

  selectProduct(product: Product) {
    this.selectedProduct = { ...product };
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      imgUrl: product.imgUrl,
    });
  }

  showUpdateForm() {
    if (this.currentView === 'users' && this.selectedUser) {
      this.isUpdateFormVisible = true;
    } else if (this.currentView === 'products' && this.selectedProduct) {
      this.isUpdateFormVisible = true;
    }
  }

  cancelUpdate() {
    this.isUpdateFormVisible = false;
    this.selectedUser = null;
    this.selectedProduct = null;
    this.productForm.reset();
    this.userInfoForm.reset();
  }

  submitUserUpdate() {
    if (this.userInfoForm.valid && this.selectedUser) {
      const updatedUser: UserDetailed = {
        id: this.selectedUser.id,
        ...this.userInfoForm.value,
      };

      this.userService.updateUserById(updatedUser.id, updatedUser).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully', updatedUser);
          this.loadUsers();
          this.isUpdateFormVisible = false;
          this.selectedUser = null;
          this.userInfoForm.reset();
        },
        error: (error) => console.error('Error updating user', error),
      });
    }
  }

  submitProductUpdate() {
    if (this.productForm.valid && this.selectedProduct) {
      const updatedProduct: Partial<Product> = {
        ...this.productForm.value,
      };

      this.productService
        .updateProduct(this.selectedProduct.productId, updatedProduct)
        .subscribe({
          next: (updatedProduct) => {
            console.log('Product updated successfully', updatedProduct);
            this.loadProducts();
            this.isUpdateFormVisible = false;
            this.selectedProduct = null;
            this.productForm.reset();
          },
          error: (error) => console.error('Error updating product', error),
        });
    }
  }

  submitAddressUpdate() {
    if (this.addressForm.valid && this.selectedUser) {
      const updatedAddress: Partial<Address> = this.addressForm.value;

      this.addressService.updateAddress(updatedAddress).subscribe({
        next: (response) => {
          console.log('Address updated successfully', response);
          // Update the selected user's address in the local data
          if (this.selectedUser) {
            this.selectedUser.address = updatedAddress as Address;
          }
          // Update the user in the users array
          const index = this.users.findIndex(
            (u) => u.id === this.selectedUser?.id
          );
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              address: updatedAddress as Address,
            };
          }
          this.isUpdateFormVisible = false;
        },
        error: (error) => console.error('Error updating address', error),
      });
    }
  }

  deleteAddress() {
    if (this.selectedUser?.id) {
      this.addressService.removeAddress().subscribe({
        next: () => {
          console.log('Address deleted successfully');
          // Update the local user data
          if (this.selectedUser) {
            this.selectedUser.address = undefined;
          }
          // Update the user in the users array
          const index = this.users.findIndex(
            (u) => u.id === this.selectedUser?.id
          );
          if (index !== -1) {
            this.users[index] = { ...this.users[index], address: undefined };
          }
          // Reset the address form
          this.addressForm.reset();
        },
        error: (error) => {
          console.error('Error deleting address', error);
        },
      });
    }
  }

  deleteUser() {
    if (this.selectedUser) {
      this.userService.deleteUserById(this.selectedUser.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers();
          this.selectedUser = null;
        },
        error: (error) => console.error('Error deleting user', error),
      });
    }
  }

  deleteProduct() {
    if (this.selectedProduct) {
      this.productService
        .deleteProduct(this.selectedProduct.productId)
        .subscribe({
          next: () => {
            console.log('Product deleted successfully');
            this.loadProducts();
            this.selectedProduct = null;
          },
          error: (error) => console.error('Error deleting product', error),
        });
    }
  }

  logout() {
    this.userService.logoutUser();
    this.router.navigate(['']);
  }

  setActiveTab(tab: 'userInfo' | 'address' | 'role') {
    this.activeTab = tab;
  }

  setView(view: 'users' | 'products') {
    if (view === 'users') {
      this.loadUsers();
    } else {
      this.loadProducts();
    }
  }
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.getTotalPages()) {
      this.currentPage = newPage;
      this.updateDisplayedProducts();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }
}
