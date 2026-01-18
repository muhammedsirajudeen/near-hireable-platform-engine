"use client";
import { registerServiceWorker } from "@/utils/regiterSW";
import { useEffect } from "react";

export default function InitSW() {
   useEffect(() => {
      console.log(`👉 InitSW`);
      registerServiceWorker();
   }, []);

   return null;
}
