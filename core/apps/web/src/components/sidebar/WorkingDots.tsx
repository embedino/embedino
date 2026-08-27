import { cn } from "~/lib/utils";

const WORKING_DOT_DELAY_MS = 200;

/**
 * The live-work signature for sidebar rows: three dots that light up in
 * sequence, one fading in as the previous fades out, so a working thread
 * reads as quiet motion instead of a colored alert. Color follows the text
 * (`bg-current`); callers decide the hue — the standard resting treatment is
 * the muted foreground, since animation itself carries the "alive" signal.
 * Under reduced motion the dots hold a calm static dim state.
 */
export function WorkingDots({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      role="presentation"
      className={cn("inline-flex shrink-0 items-center gap-[3px]", className)}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-[3.5px] rounded-full bg-current opacity-25 motion-safe:animate-working-dot"
          style={index > 0 ? { animationDelay: `${index * WORKING_DOT_DELAY_MS}ms` } : undefined}
        />
      ))}
    </span>
  );
}
