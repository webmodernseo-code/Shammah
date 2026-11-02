"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoLogoutGuard() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (active && (!response.ok || !data?.authenticated)) {
          router.replace("/signin?reason=session-expired");
        }
      } catch {
        // A transient network failure must not log an administrator out.
      }
    };

    verifySession();
    const interval = window.setInterval(verifySession, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
