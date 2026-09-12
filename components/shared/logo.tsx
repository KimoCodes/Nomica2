"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  alt?: string;
  priority?: boolean;
}

export function Logo({
  className = "h-8 w-auto",
  width = 120,
  height = 36,
  fallbackSrc = "/logo2.png",
  alt = "NomiTips",
  priority = false,
}: LogoProps) {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    fetch("/api/brand-assets/logo")
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setSrc(data.url);
      })
      .catch(() => {});
  }, []);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setSrc(fallbackSrc)}
    />
  );
}

export function DarkLogo({
  className = "h-8 w-auto",
  width = 120,
  height = 36,
}: Omit<LogoProps, "fallbackSrc" | "alt">) {
  return (
    <Logo
      className={className}
      width={width}
      height={height}
      fallbackSrc="/logo2.png"
      alt="NomiTips"
    />
  );
}
