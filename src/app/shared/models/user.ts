import { Address } from './address.mode';

export interface User {
  userId?: string;
  firstname: string;
  lastname: string;
  password?: string;
  email: string;
}

export interface UserDetailed {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  address?: Address;
  roles: RoleModel[];
}

// export interface UserDetailed {
//   id: string;
//   email: string;
//   firstname: string;
//   lastname: string;
//   address: {
//     streetAddress: string;
//     city: string;
//     zipCode: string;
//     country: string;
//   } | null;
//   roles: string[];
// }

export interface Credentials {
  email: string;
  password: string;
}

export interface LoggedInUser {
  userId: string;
  Email: string;
  Firstname: string;
  Lastname: string;
}

export interface TokenModel {
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RoleModel {
  name: string;
}

export interface PasswordChangeModel {
  currentPassword: string;
  newPassword: string;
}
