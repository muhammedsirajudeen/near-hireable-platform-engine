// app/utils/registerSW.ts

export async function registerServiceWorker() {
   if ("serviceWorker" in navigator) {
      console.log(`👉 Registering service worker`);
      await navigator.serviceWorker.register("/sw.js");
   }
}
