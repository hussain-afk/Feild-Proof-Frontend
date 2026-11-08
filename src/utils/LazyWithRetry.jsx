import { lazy } from "react";

export function lazyWithRetry(factory) {
  return lazy(async () => {
    const key = "chunk_reload_v1";

    try {
      const module = await factory();
      // success → flag hatao
      sessionStorage.removeItem(key);
      return module;
    } catch (error) {
      const alreadyReloaded = sessionStorage.getItem(key);

      if (!alreadyReloaded) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        // React ko kuch return chahiye jab tak reload ho
        return { default: () => null };
      }

      sessionStorage.removeItem(key);
      throw error;
    }
  });
}