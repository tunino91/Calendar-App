import { Role } from '../types/users.types';

export class CreateUserDto {
  public first_name: string;
  public last_name: string;
  public role: Role;
}
