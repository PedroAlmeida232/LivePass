interface DividerProps {
  className?: string;
}

export function Divider({ className = "" }: DividerProps) {
  return (
    <div
      className={`
        w-full h-px
        bg-gradient-to-r from-transparent via-primary/40 to-transparent
        ${className}
      `}
      role="separator"
    />
  );
}
