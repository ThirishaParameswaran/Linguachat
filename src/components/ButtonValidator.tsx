import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { ValidationStatus } from '../hooks/useButtonValidation';

export interface ButtonValidatorProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  status?: ValidationStatus;
  isValid?: boolean;
  errorMessage?: string | null;
  tooltipText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  showStatusIcon?: boolean;
  isLoading?: boolean;
}

export const ButtonValidator: React.FC<ButtonValidatorProps> = ({
  children,
  status = 'idle',
  isValid = true,
  errorMessage,
  tooltipText,
  variant = 'primary',
  size = 'md',
  icon,
  showStatusIcon = true,
  isLoading = false,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const actuallyLoading = isLoading || status === 'validating';
  const actuallyDisabled = disabled || actuallyLoading || (status === 'invalid' && !isValid);

  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[50px]',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500',
    outline:
      'border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
  };

  const activeMessage = errorMessage || tooltipText;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <button
        disabled={actuallyDisabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        onClick={(e) => {
          if (!actuallyDisabled && onClick) {
            onClick(e);
          }
        }}
        {...props}
      >
        {actuallyLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <>
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
            <span>{children}</span>
            {showStatusIcon && status === 'valid' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1 animate-pulse" />
            )}
            {showStatusIcon && status === 'invalid' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-1" />
            )}
          </>
        )}
      </button>

      {/* Interactive Tooltip on validation failure or info */}
      {showTooltip && activeMessage && (
        <div
          role="tooltip"
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded-lg shadow-lg z-50 whitespace-nowrap pointer-events-none transition-all duration-200 ${
            status === 'invalid'
              ? 'bg-rose-900/95 text-rose-100 border border-rose-700 shadow-rose-900/40'
              : status === 'valid'
              ? 'bg-emerald-900/95 text-emerald-100 border border-emerald-700 shadow-emerald-900/40'
              : 'bg-slate-900/95 text-slate-100 border border-slate-700 shadow-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {status === 'invalid' ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-300" />
            ) : status === 'valid' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            )}
            <span>{activeMessage}</span>
          </div>
          {/* Arrow */}
          <div
            className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
              status === 'invalid'
                ? 'bg-rose-900 border-r border-b border-rose-700'
                : status === 'valid'
                ? 'bg-emerald-900 border-r border-b border-emerald-700'
                : 'bg-slate-900 border-r border-b border-slate-700'
            }`}
          />
        </div>
      )}
    </div>
  );
};
