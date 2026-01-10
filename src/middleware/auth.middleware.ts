import { IJwtPayload } from "@/lib/jwt.util";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest } from "next/server";

export interface IAuthenticatedRequest extends NextRequest {
   user?: IJwtPayload;
}

export async function authenticateRequest(request: NextRequest): Promise<IJwtPayload> {
   const { JwtService } = await import("@/lib/jwt.util");
   const jwtService = new JwtService();

   const accessToken = request.cookies.get("accessToken")?.value;

   if (!accessToken) {
      throw new Error("Authentication required");
   }

   try {
      const payload = jwtService.verifyAccessToken(accessToken);
      return payload;
   } catch (error) {
      throw new Error("Invalid or expired token");
   }
}

export async function requireAdmin(request: NextRequest): Promise<IJwtPayload> {
   const user = await authenticateRequest(request);

   if (user.role !== UserRole.ADMIN) {
      throw new Error("Admin access required");
   }

   return user;
}
