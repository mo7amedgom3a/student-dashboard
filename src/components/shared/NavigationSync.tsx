"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { registerAppRouter, pathToRoute } from "@/lib/routes";

/**
 * Synchronizes the browser's Next.js App Router state with the in-memory
 * Zustand app store. Mount once inside the root layout.
 */
export function NavigationSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Register the Next.js router instance so store.navigate() transitions using Next.js
  useEffect(() => {
    registerAppRouter(router);
    return () => {
      registerAppRouter(null);
    };
  }, [router]);

  // Synchronize URL changes to Zustand store route
  useEffect(() => {
    if (!pathname) return;
    const currentRoute = useAppStore.getState().route;
    const targetRoute = pathToRoute(pathname, searchParams);

    const isNameDifferent = currentRoute.name !== targetRoute.name;
    const isParamsDifferent =
      JSON.stringify(currentRoute.params ?? {}) !== JSON.stringify(targetRoute.params ?? {});

    if (isNameDifferent || isParamsDifferent) {
      useAppStore.setState((state) => ({
        route: targetRoute,
        history: isNameDifferent ? [...state.history, state.route] : state.history,
      }));
    }
  }, [pathname, searchParams]);

  return null;
}
