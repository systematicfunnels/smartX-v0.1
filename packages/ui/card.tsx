import React from 'react';

// Card Component
export interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return {
    type: 'card',
    title,
    children,
    className
  };
}
