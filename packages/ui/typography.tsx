// Typography Component
export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
  children: string;
  className?: string;
}

export function Typography({ variant = 'body1', children, className }: TypographyProps) {
  return {
    variant,
    children,
    className
  };
}
