import { UserRole } from "@/types/enums/role.enum";
import jwt from "jsonwebtoken";
import "reflect-metadata";
import { injectable } from "tsyringe";

export interface IJwtPayload {
   userId: string;
   role: UserRole;
}

export interface IRefreshPayload {
   userId: string;
}

@injectable()
export class JwtService {
   private readonly accessSecret: string;
   private readonly refreshSecret: string;
   private readonly accessExpiry: string;
   private readonly refreshExpiry: string;

   constructor() {
      this.accessSecret = process.env.JWT_ACCESS_SECRET!;
      this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
      this.accessExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
      this.refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

      if (!this.accessSecret || !this.refreshSecret) {
         throw new Error("JWT secrets are not defined in environment variables");
      }
   }

   generateAccessToken(userId: string, role: UserRole): string {
      const payload: IJwtPayload = { userId, role };
      return jwt.sign(payload, this.accessSecret, {
         expiresIn: this.accessExpiry,
      } as jwt.SignOptions);
   }

   generateRefreshToken(userId: string): string {
      const payload: IRefreshPayload = { userId };
      return jwt.sign(payload, this.refreshSecret, {
         expiresIn: this.refreshExpiry,
      } as jwt.SignOptions);
   }

   verifyAccessToken(token: string): IJwtPayload {
      try {
         const decoded = jwt.verify(token, this.accessSecret) as IJwtPayload;
         return decoded;
      } catch (error) {
         throw new Error("Invalid or expired access token");
      }
   }

   verifyRefreshToken(token: string): IRefreshPayload {
      try {
         const decoded = jwt.verify(token, this.refreshSecret) as IRefreshPayload;
         return decoded;
      } catch (error) {
         throw new Error("Invalid or expired refresh token");
      }
   }
}
