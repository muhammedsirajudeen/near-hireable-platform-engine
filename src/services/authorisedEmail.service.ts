import { ERROR_MESSAGES } from "@/error/messages";
import RouteError from "@/error/routeError";
import { ConnectDB } from "@/lib/decorators/connectDB.decorator";
import AuthorisedEmail from "@/models/AuthorisedEmail";
import { IAuthorisedEmailDto } from "@/types/authorisedEmails.dto";
import { UserRole } from "@/types/enums/role.enum";
import { toAuthorisedEmailsDto } from "@/types/mappers/toAuthorisedEmailsDto";
import { HttpStatusCode } from "axios";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import { UserService } from "./user.service";

@injectable()
export class AuthorisedEmailService {
   constructor(@inject(UserService) private userService: UserService) {}

   @ConnectDB()
   async getAllAuthorisedEmails(): Promise<IAuthorisedEmailDto[]> {
      const emails = await AuthorisedEmail.find().lean();
      return emails.map(toAuthorisedEmailsDto);
   }

   @ConnectDB()
   async createAuthorisedEmail({ userId, email }: { userId?: string; email: string }): Promise<IAuthorisedEmailDto> {
      if (userId) {
         const user = await this.userService.findUserById(userId);
         if (user && user.role != UserRole.ADMIN) {
            throw new RouteError(ERROR_MESSAGES.UNAUTHORIZED, HttpStatusCode.Unauthorized);
         }
      }

      const authEmails = await AuthorisedEmail.create({ email });
      return toAuthorisedEmailsDto(authEmails);
   }
}
