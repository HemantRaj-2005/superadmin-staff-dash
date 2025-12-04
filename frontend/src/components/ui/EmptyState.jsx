import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconSize = "lg",
  variant = "default",
}) => {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconContainerSizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-12", className)}>
        {Icon && (
          <div className={cn("inline-flex items-center justify-center rounded-full bg-muted/50 mb-4", iconContainerSizes[iconSize])}>
            <Icon className={cn("text-muted-foreground", iconSizes[iconSize])} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-primary/5 via-background to-primary/5", className)}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          {Icon && (
            <div className={cn(
              "inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 animate-float",
              iconContainerSizes[iconSize]
            )}>
              <Icon className={cn("text-primary", iconSizes[iconSize])} />
            </div>
          )}
          <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              {description}
            </p>
          )}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-0 shadow-md", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        {Icon && (
          <div className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted/50 mb-6",
            iconContainerSizes[iconSize]
          )}>
            <Icon className={cn("text-muted-foreground", iconSizes[iconSize])} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="default" size="sm">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;

