import type { ButtonHTMLAttributes, ReactNode } from "react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "hint" | "danger" | "ghost";
  icon?: ReactNode;
}

export function GameButton({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}: GameButtonProps) {
  return (
    <button className={`game-button game-button--${variant} ${className}`} {...props}>
      {icon ? <span className="button-icon" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
