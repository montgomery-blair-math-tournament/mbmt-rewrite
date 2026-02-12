import Link from "next/link";
import React from "react";

export default function Link2({
  href,
  children,
  target,
}: {
  href: string;
  children?: React.ReactNode;
  target?: string;
}) {
  return (
    <Link
      className="dark:text-blue-400 text-[#2969a1] hover:underline"
      href={href}
      target={target}>
      {children}
    </Link>
  );
}
