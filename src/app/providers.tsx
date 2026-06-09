"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // skip in dev if key not set

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: true,   // auto page-view tracking
      capture_pageleave: true,  // track session depth
      persistence: "localStorage",
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
