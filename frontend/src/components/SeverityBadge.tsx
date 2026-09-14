import React from "react";

type SeverityType = "normal" | "low" | "moderate" | "severe" | string;

interface Props {
  severity: SeverityType;
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, showIcon = true, className = "" }) => {
  const normSev = (severity || "normal").toLowerCase();

  let bg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
  let label = "Normal / Road Clear";
  let dot = "bg-emerald-500";

  if (normSev === "low") {
    bg = "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400";
    label = "Low Waterlogging / Caution";
    dot = "bg-yellow-500";
  } else if (normSev === "moderate") {
    bg = "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400";
    label = "Moderate / Avoid if Possible";
    dot = "bg-amber-500";
  } else if (normSev === "severe" || normSev === "critical") {
    bg = "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400";
    label = "Severe / Road Unsafe";
    dot = "bg-rose-500 animate-pulse";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${bg} ${className}`}
    >
      {showIcon && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      <span>{label}</span>
    </span>
  );
};

export default SeverityBadge;
