"use client";

import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {});

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const skipWaiting = () => {
    if (!navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
  };

  return { updateAvailable, skipWaiting };
}
