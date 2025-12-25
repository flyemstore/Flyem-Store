import React, { useEffect } from "react";
import api from "../api/index";

export default function CustomCodeInjector() {
  useEffect(() => {
    const injectCode = async () => {
      try {
        console.log("💉 Injector: Fetching custom code..."); // Debug Log 1
        
        const data = await api.request(`/site?t=${Date.now()}`);
        console.log("💉 Injector: Data received:", data); // Debug Log 2

        if (!data || !data.customCode) {
            console.log("❌ Injector: No custom code found in database.");
            return;
        }

        // 1. Inject Head Code
        if (data.customCode.headCode) {
           console.log("✅ Injecting HEAD code...");
           const headRange = document.createRange();
           headRange.setStart(document.head, 0);
           document.head.appendChild(headRange.createContextualFragment(data.customCode.headCode));
        }

        // 2. Inject Body Code
        if (data.customCode.bodyCode) {
           console.log("✅ Injecting BODY code...");
           const bodyRange = document.createRange();
           bodyRange.setStart(document.body, 0);
           document.body.appendChild(bodyRange.createContextualFragment(data.customCode.bodyCode));
        }

      } catch (error) {
        console.error("❌ Injector Failed:", error);
      }
    };

    injectCode();
  }, []);

  return null;
}