import RouteError from "@/error/routeError";
import { ConnectDB } from "@/lib/decorators/connectDB.decorator";
import { JwtService } from "@/lib/jwt.util";
import { comparePassword, hashPassword } from "@/lib/password.util";
import AuthorisedEmail from "@/models/AuthorisedEmail";
import { UserRole } from "@/types/enums/role.enum";
import { IUserDto } from "@/types/user.dto";
import { HttpStatusCode } from "axios";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import { UserService } from "./user.service";

export interface IAuthTokens {
   accessToken: string;
   refreshToken: string;
}

@injectable()
export class AuthService {
   constructor(@inject(UserService) private userService: UserService, @inject(JwtService) private jwtService: JwtService) {}

   async adminLogin(password: string): Promise<{ tokens: IAuthTokens; user: IUserDto }> {
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
         throw new RouteError("Admin password not configured", HttpStatusCode.InternalServerError);
      }

      if (password !== adminPassword) {
         throw new RouteError("Invalid admin password", HttpStatusCode.Unauthorized);
      }

      // Find or create admin user
      let adminUser = await this.userService.findUserByEmail("admin@system.local");

      if (!adminUser) {
         adminUser = await this.userService.createUser({
            name: "Admin",
            email: "admin@system.local",
         });
         // Update role to admin
         await this.updateUserRole(adminUser.id, UserRole.ADMIN);
         adminUser = (await this.userService.findUserById(adminUser.id))!;
      }

      const tokens = this.generateTokens(adminUser.id, adminUser.role);

      return { tokens, user: adminUser };
   }

   @ConnectDB()
   async userSignup(name: string, email: string, password: string): Promise<{ tokens: IAuthTokens; user: IUserDto }> {
      // Check if email is authorized
      const authorizedEmail = await AuthorisedEmail.findOne({ email: email.toLowerCase() }).lean();

      if (!authorizedEmail) {
         throw new RouteError("Email not authorized. Please contact admin.", HttpStatusCode.Forbidden);
      }

      // Check if user already exists
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
         throw new RouteError("User already exists", HttpStatusCode.Conflict);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await this.userService.createUser({
         name,
         email,
         password: hashedPassword,
      });

      const tokens = this.generateTokens(user.id, user.role);

      return { tokens, user };
   }

   async userSignin(email: string, password: string): Promise<{ tokens: IAuthTokens; user: IUserDto }> {
      // Find user with password
      const user = await this.userService.findUserByEmailWithPassword(email);

      if (!user || !user.password) {
         throw new RouteError("Invalid credentials", HttpStatusCode.Unauthorized);
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
         throw new RouteError("Invalid credentials", HttpStatusCode.Unauthorized);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const tokens = this.generateTokens(user.id, user.role);

      return { tokens, user: userWithoutPassword };
   }

   async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
      try {
         const payload = this.jwtService.verifyRefreshToken(refreshToken);

         const user = await this.userService.findUserById(payload.userId);

         if (!user) {
            throw new RouteError("User not found", HttpStatusCode.Unauthorized);
         }

         return this.generateTokens(user.id, user.role);
      } catch (error) {
         throw new RouteError("Invalid refresh token", HttpStatusCode.Unauthorized);
      }
   }

   async getCurrentUser(userId: string): Promise<IUserDto> {
      const user = await this.userService.findUserById(userId);

      if (!user) {
         throw new RouteError("User not found", HttpStatusCode.NotFound);
      }

      return user;
   }

   private generateTokens(userId: string, role: UserRole): IAuthTokens {
      const accessToken = this.jwtService.generateAccessToken(userId, role);
      const refreshToken = this.jwtService.generateRefreshToken(userId);

      return { accessToken, refreshToken };
   }

   @ConnectDB()
   private async updateUserRole(userId: string, role: UserRole): Promise<void> {
      const User = (await import("@/models/User")).default;
      await User.findByIdAndUpdate(userId, { role });
   }

   @ConnectDB()
   async googleAuth(credential: string): Promise<{ tokens: IAuthTokens; user: IUserDto }> {
      const { OAuth2Client } = await import("google-auth-library");
      const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

      // Verify the Google token
      const ticket = await client.verifyIdToken({
         idToken: credential,
         audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
         throw new RouteError("Invalid Google token", HttpStatusCode.Unauthorized);
      }

      const { email, name } = payload;

      // Check if email is authorized
      const authorizedEmail = await AuthorisedEmail.findOne({
         email: email.toLowerCase(),
      }).lean();

      if (!authorizedEmail) {
         throw new RouteError("Email not authorized. Please contact admin to get access.", HttpStatusCode.Forbidden);
      }

      // Find or create user
      let user = await this.userService.findUserByEmail(email);

      if (!user) {
         user = await this.userService.createUser({
            name: name || email.split("@")[0],
            email,
         });
      }

      const tokens = this.generateTokens(user.id, user.role);

      return { tokens, user };
   }
}
