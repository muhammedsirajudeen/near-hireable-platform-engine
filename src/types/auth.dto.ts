import { UserRole } from "@/types/enums/role.enum";

export interface ILoginResponseDto {
   success: boolean;
   user?: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
   };
   message?: string;
}

export interface IAdminLoginRequestDto {
   password: string;
}

export interface IUserSignupRequestDto {
   name: string;
   email: string;
   password: string;
}

export interface IUserSigninRequestDto {
   email: string;
   password: string;
}

export interface IRefreshTokenRequestDto {
   refreshToken: string;
}
