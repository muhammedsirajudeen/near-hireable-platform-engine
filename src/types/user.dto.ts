import { UserRole } from "./enums/role.enum";

export interface IUserDto {
   id: string;
   name: string;
   email: string;
   role: UserRole;
   prdStatus?: "none" | "pending" | "approved";
   createdAt: Date;
   updatedAt: Date;
}
