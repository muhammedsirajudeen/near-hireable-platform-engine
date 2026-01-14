import RouteError from "@/error/routeError";
import { IJwtPayload } from "@/lib/jwt.util";
import { UserRole } from "@/types/enums/role.enum";
import { HttpStatusCode } from "axios";
import { NextRequest } from "next/server";

export interface IAuthenticatedRequest extends NextRequest {
   user?: IJwtPayload;
}

export async function authenticateRequest(request: NextRequest): Promise<IJwtPayload> {
   const { JwtService } = await import("@/lib/jwt.util");
   const jwtService = new JwtService();

   const accessToken = request.cookies.get("accessToken")?.value;

   if (!accessToken) {
      throw new RouteError("Authentication required", HttpStatusCode.Unauthorized);
   }

   try {
      const payload = jwtService.verifyAccessToken(accessToken);
      return payload;
   } catch (error) {
      throw new RouteError("Invalid or expired token", HttpStatusCode.Unauthorized);
   }
}

export async function requireAdmin(request: NextRequest): Promise<IJwtPayload> {
   const user = await authenticateRequest(request);

   if (user.role !== UserRole.ADMIN) {
      throw new RouteError("Admin access required", HttpStatusCode.Forbidden);
   }

   return user;
}
