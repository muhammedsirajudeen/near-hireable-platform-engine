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
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor): any {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: unknown, ...args: unknown[]) {
         // Connect to database before executing the method
         await connectDB();
         // Execute the original method
         return originalMethod?.apply(this, args);
      };

      return descriptor;
   };
}
