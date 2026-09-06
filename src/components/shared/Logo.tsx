import { useId } from "react";
import { cn } from "@/lib/utils";

const LOGO_PATH =
  "M1280.3,150.9v59.5c-15.7-0.1-29.9-6.5-40.2-16.8l-2.6-2.5l-31-31l-1.1-1.1c-10.3-10.1-24.5-16.3-40.1-16.3v67.7c-15.7-0.1-29.9-6.5-40.2-16.8l-2.6-2.5l-31-31l-1.1-1.1c-10.3-10.1-24.5-16.3-40.1-16.3v67.7H993v67.7h57.5v-59.5c15.7,0,29.9,6.3,40.2,16.4c0.3,0.2,0.6,0.5,0.8,0.8l33.7,33.7c10.3,10.3,24.5,16.7,40.2,16.8v-67.7c15.7,0,29.9,6.3,40.2,16.4c0.3,0.2,0.6,0.5,0.8,0.8l33.7,33.7c10.3,10.3,24.5,16.7,40.2,16.8v-67.7h57.5v-67.7H1280.3z";

export interface LogoProps {
  className?: string;
  animated?: boolean;
  withLabel?: boolean;
  labelClassName?: string;
}

export function Logo({
  className,
  animated = false,
  withLabel = false,
  labelClassName,
}: LogoProps) {
  const shimmerId = useId().replace(/:/g, "");
  const maskId = useId().replace(/:/g, "");

  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
      <svg
        viewBox="980 135 370 175"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mastery Academy"
        className={cn("logo-svg shrink-0", animated && "logo-animated", className)}
        aria-hidden={withLabel ? "true" : undefined}
      >
        <defs>
          <linearGradient id={shimmerId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FF6555" stopOpacity="1" />
            <stop offset="45%" stopColor="#FF6555" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFC9BE" stopOpacity="1" />
            <stop offset="55%" stopColor="#FF6555" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6555" stopOpacity="1" />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="980" y="135" width="370" height="175">
            <path fill="#ffffff" d={LOGO_PATH} />
          </mask>
        </defs>
        {animated ? (
          <g mask={`url(#${maskId})`}>
            <rect
              className="logo-shimmer-rect"
              x="600"
              y="100"
              width="1150"
              height="220"
              fill={`url(#${shimmerId})`}
            />
          </g>
        ) : (
          <path fill="#FF6555" d={LOGO_PATH} />
        )}
      </svg>
      {withLabel && (
        <span
          className={cn(
            "hidden sm:inline text-sm sm:text-base font-bold tracking-tight text-shimmer",
            labelClassName,
          )}
        >
          MasteryAcademy
        </span>
      )}
    </span>
  );
}
