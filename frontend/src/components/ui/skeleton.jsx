import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}) {
  const variants = {
    default: "bg-muted animate-pulse",
    shimmer: "bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer bg-[length:200%_100%]",
    pulse: "bg-muted animate-pulse",
  };

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        variants[variant] || variants.default,
        className
      )}
      {...props} />
  );
}

export { Skeleton }
