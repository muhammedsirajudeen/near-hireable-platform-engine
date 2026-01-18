export function shouldShowPushPopup() {
   const lastShown = localStorage.getItem("push-popup-last-shown");

   if (!lastShown) return true; // never shown

   const ONE_DAY = 24 * 60 * 60 * 1000; // ms
   const now = Date.now();

   return now - Number(lastShown) > ONE_DAY;
}
