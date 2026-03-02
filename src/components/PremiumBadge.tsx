import React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface PremiumBadgeProps {
  className?: string;
  text?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className, text = "Premium" }) => (
  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-coral", className)}>
    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    {text}
  </span>
);

export default PremiumBadge;
