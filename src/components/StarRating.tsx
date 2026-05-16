import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function StarRating({
  value, onChange, size = 28, readOnly,
}: { value: number; onChange?: (n: number) => void; size?: number; readOnly?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn(
            "transition-all",
            !readOnly && "hover:scale-125 cursor-pointer",
            readOnly && "cursor-default",
          )}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
