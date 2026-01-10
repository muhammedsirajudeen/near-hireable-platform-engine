import connectDB from "@/lib/db";

/**
 * Method decorator that automatically connects to the database before executing the method
 * @example
 * class MyService {
 *   @ConnectDB()
 *   async getUsers() {
 *     // Database is already connected here
 *   }
 * }
 */
export function ConnectDB() {
   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
         // Connect to database before executing the method
         await connectDB();
         // Execute the original method
         return originalMethod.apply(this, args);
      };

      return descriptor;
   };
}
