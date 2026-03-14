"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { ComponentChildren } from "preact";

import { cn } from "@/lib/utils";

type ProgressProps = Omit<ProgressPrimitive.Root.Props, "value"> & {
  indeterminate?: boolean;
  value?: ProgressPrimitive.Root.Props["value"];
};

function Progress({
  className,
  children,
  indeterminate = false,
  value,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      value={indeterminate ? undefined : value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        {indeterminate ? (
          <IndeterminateProgressIndicator />
        ) : (
          <ProgressIndicator />
        )}
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({
  children,
  className,
  ...props
}: ProgressPrimitive.Track.Props & { children?: ComponentChildren }) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted",
        className,
      )}
      data-slot="progress-track"
      {...props}
    >
      {children}
    </ProgressPrimitive.Track>
  );
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary", className)}
      {...props}
    />
  );
}

function IndeterminateProgressIndicator() {
  return (
    <>
      <span
        aria-hidden="true"
        className="bg-primary/85 absolute inset-y-0 left-0 w-1/3 rounded-md"
        style={{
          animation: "cc-progress-indeterminate 1.1s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes cc-progress-indeterminate {
          0% {
            transform: translateX(-120%);
          }

          55% {
            transform: translateX(140%);
          }

          100% {
            transform: translateX(260%);
          }
        }
      `}</style>
    </>
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-xs/relaxed font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-xs/relaxed text-muted-foreground tabular-nums",
        className,
      )}
      data-slot="progress-value"
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
