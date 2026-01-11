import { IUserDocument } from "@/models/User";
import { IUserDto } from "../user.dto";

export function toUserDto(user: IUserDocument): IUserDto {
   return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      prdStatus: user.prdStatus || "none",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
   };
}
