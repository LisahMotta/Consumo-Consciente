import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium focus:outline-none';
  const variants: Record<string,string> = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    ghost: 'bg-transparent text-teal-700 hover:bg-teal-50'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
