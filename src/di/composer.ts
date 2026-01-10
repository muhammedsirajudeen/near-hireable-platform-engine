import { container } from "@/lib/container";
import { JwtService } from "@/lib/jwt.util";
import { AuthService } from "@/services/auth.service";
import { AuthorisedEmailService } from "@/services/authorisedEmail.service";
import { UserService } from "@/services/user.service";

// Export service instances
export const userService = container.resolve(UserService);
export const authorisedEmailService = container.resolve(AuthorisedEmailService);
export const jwtService = container.resolve(JwtService);
export const authService = container.resolve(AuthService);
