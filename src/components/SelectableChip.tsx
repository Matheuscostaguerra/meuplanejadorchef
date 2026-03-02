import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
  className?: string;
}

const SelectableChip: React.FC<ChipProps> = ({ label, selected, onClick, icon, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
      selected
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-mint/40 text-mint-foreground hover:bg-mint/60",
      className
    )}
  >
    {icon && <span>{icon}</span>}
    {label}
  </button>
);

export default SelectableChip;
