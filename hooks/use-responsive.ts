"use client";

import { useState, useEffect } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return "mobile";
  if (width < 768) return "tablet";
  if (width < 1280) return "desktop";
  return "wide";
}

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const bp = getBreakpoint(width);
      setBreakpoint(bp);
      setIsMobile(bp === "mobile");
      setIsTablet(bp === "tablet");
      setIsDesktop(bp === "desktop" || bp === "wide");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { breakpoint, isMobile, isTablet, isDesktop };
}
