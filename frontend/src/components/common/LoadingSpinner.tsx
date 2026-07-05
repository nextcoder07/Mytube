// src/components/common/LoadingSpinner.tsx
import React from "react";

export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-violet-500 border-r-pink-500 border-b-transparent border-l-transparent`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}
