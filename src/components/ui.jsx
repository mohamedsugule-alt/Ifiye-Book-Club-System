import { cn } from "../utils/cn";

export const Card = ({ children, className }) => (
  <div className={cn(
    "glass-card transition-all duration-300",
    "hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/10",
    className
  )}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-white/10 text-glass-300 border border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/20 text-red-400 border border-red-500/20",
    brand: "bg-brand-primary/20 text-brand-secondary border border-brand-primary/20",
    secondary: "bg-white/5 text-glass-400 border border-white/5",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const ProgressBar = ({ value, max = 100, variant = 'brand', className }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5", className)}>
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]",
          variant === 'brand' && "bg-gradient-to-r from-purple-500 to-pink-500",
          variant === 'success' && "bg-emerald-500",
          variant === 'danger' && "bg-red-500",
          variant === 'warning' && "bg-amber-500",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
