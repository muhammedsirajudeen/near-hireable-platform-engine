import { IAuthorisedDocument } from "@/models/AuthorisedEmail";
import { IAuthorisedEmailDto } from "../authorisedEmails.dto";

export const toAuthorisedEmailsDto = (authorisedEmail: IAuthorisedDocument): IAuthorisedEmailDto => {
   return {
      id: authorisedEmail._id.toString(),
      email: authorisedEmail.email,
      createdAt: authorisedEmail.createdAt,
      updatedAt: authorisedEmail.updatedAt,
   };
};
