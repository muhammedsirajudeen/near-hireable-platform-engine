import { IUserDocument } from "@/models/User";
import { UserRole } from "./enums/role.enum";

export interface IUserDto {
   id: string;
   name: string;
   email: string;
   role: UserRole;
   createdAt: Date;
   updatedAt: Date;
}
