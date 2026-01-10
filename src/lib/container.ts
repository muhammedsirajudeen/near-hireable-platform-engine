import "reflect-metadata";
import { container } from "tsyringe";

// Import and register all services here
import { UserService } from "@/services/user.service";

// Register services
container.registerSingleton(UserService);

export { container };
