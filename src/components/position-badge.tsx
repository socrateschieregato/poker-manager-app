import { Trophy } from "lucide-react";

interface PositionBadgeProps {
  position: number;
}

export function PositionBadge({ position }: PositionBadgeProps) {
  if (position <= 3) {
    const colors: Record<number, string> = {
      1: "text-[#FFD700]",
      2: "text-[#C0C0C0]",
      3: "text-[#22C55E]",
    };
    return (
      <span className="flex items-center gap-1.5 font-bold">
        <Trophy className={`h-4 w-4 ${colors[position]}`} />
        <span className={colors[position]}>{position}</span>
      </span>
    );
  }

  return <span className="pl-6 font-medium text-muted-foreground">{position}</span>;
}
