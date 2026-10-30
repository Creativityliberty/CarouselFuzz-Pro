import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'glass' | 'danger' | 'white' | 'ghost' | 'neon';
  active?: boolean;
  className?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'glass', 
  active, 
  className = "", 
  disabled, 
  size = 'md',
  id,
  type = 'button'
}) => {
  const base = "px-5 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 font-bold whitespace-nowrap active:scale-95 disabled:pointer-events-none cursor-pointer";
  
  const styles = {
    primary: "bg-[#1d4ed8] text-white shadow-[0_12px_25px_-6px_rgba(29,78,216,0.45)] hover:bg-[#1e40af] disabled:opacity-50",
    white: "bg-white text-slate-900 border border-slate-200/80 shadow-md hover:bg-slate-50 disabled:opacity-50",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
    neon: "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white shadow-sm",
    glass: active 
      ? "bg-blue-50 text-blue-600 border border-blue-300 shadow-sm" 
      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
  };
  
  const sizes = { 
    xs: "text-[10px] py-1 px-3", 
    sm: "text-xs py-1.5 px-4", 
    md: "text-sm py-2.5 px-5", 
    lg: "text-base py-3 px-6",
    xl: "text-lg py-4 px-8"
  };

  return (
    <button 
      id={id}
      type={type}
      disabled={disabled} 
      onClick={onClick} 
      className={`${base} ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
