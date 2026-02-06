export const formatMessageTime = (dateInput: string | Date | number): string => {
   const date = new Date(dateInput);
   const now = new Date();

   // Reset time parts for accurate day comparison
   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

   const diffTime = today.getTime() - inputDate.getTime();
   const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

   const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
   };

   const timeString = date.toLocaleTimeString([], timeOptions);

   if (diffDays === 0) {
      return timeString;
   }

   if (diffDays === 1) {
      return `Yesterday, ${timeString}`;
   }

   const isThisYear = date.getFullYear() === now.getFullYear();

   if (isThisYear) {
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeString}`;
   }

   // Format: DD/MM/YYYY, HH:MM AM/PM
   return `${date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" })}, ${timeString}`;
};
