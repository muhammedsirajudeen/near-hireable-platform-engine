import { ConnectDB } from "@/lib/decorators/connectDB.decorator";
import User from "@/models/User";
import { toUserDto } from "@/types/mappers/toUserDto";
import { IUserDto } from "@/types/user.dto";
import "reflect-metadata";
import { injectable } from "tsyringe";

@injectable()
export class UserService {
   @ConnectDB()
   async getAllUsers(): Promise<IUserDto[]> {
      const users = await User.find().lean();
      return users.map(toUserDto);
   }

   @ConnectDB()
   async findUserById(userId: string): Promise<IUserDto | null> {
      const user = await User.findById(userId).lean();
      return user ? toUserDto(user) : null;
   }

   @ConnectDB()
   async findUserByEmail(email: string): Promise<IUserDto | null> {
      const user = await User.findOne({ email }).lean();
      return user ? toUserDto(user) : null;
   }

   @ConnectDB()
   async createUser({ name, email, password }: { name: string; email: string; password?: string }): Promise<IUserDto> {
      const user = await User.create({ name, email, password });
      return toUserDto(user);
   }

   @ConnectDB()
   async findUserByEmailWithPassword(email: string): Promise<(IUserDto & { password?: string }) | null> {
      const user = await User.findOne({ email }).select("+password").lean();
      if (!user) return null;
      return {
         ...toUserDto(user),
         password: user.password,
      };
   }

   @ConnectDB()
   async updateUserPassword(userId: string, password: string): Promise<void> {
      await User.findByIdAndUpdate(userId, { password });
   }
}
