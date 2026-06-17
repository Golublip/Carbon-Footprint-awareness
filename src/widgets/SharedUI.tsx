import React, { useEffect, useRef } from 'react';

// --- ACCESSIBLE CARD ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', tabIndex, ariaLabel }) => {
  return (
    <div
      className={`bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${className}`}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

// --- ACCESSIBLE BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
  ariaLabel: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ariaLabel,
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#10b981] hover:bg-[#059669] text-zinc-950 font-semibold',
    secondary: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    ghost: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-none border border-transparent bg-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// --- ACCESSIBLE INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  ariaDescribedBy?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  className = '',
  ariaDescribedBy,
  ...props
}) => {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        className={`w-full bg-[#ffffff] dark:bg-[#09090b] border ${
          error ? 'border-rose-500 focus:ring-rose-500/50' : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/50 focus:border-blue-500'
        } rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 text-zinc-950 dark:text-zinc-100 transition-all ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : ariaDescribedBy}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs text-rose-500 mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

// --- ACCESSIBLE SELECT ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        className={`w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 transition-all cursor-pointer ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// --- ACCESSIBLE DIALOG / MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  ariaLabelledBy?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, ariaLabelledBy }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Trap focus
      const elements = modalRef.current.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]'
      );
      const focusable = Array.from(elements).filter(
        el => el.getAttribute('tabindex') !== '-1'
      );
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={ariaLabelledBy || "modal-title"}>
      <div
        ref={modalRef}
        className="bg-white dark:bg-[#0c0c0f] w-full max-w-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden focus:outline-none p-6"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h2 id={ariaLabelledBy || "modal-title"} className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// --- ACCESSIBLE TOOLTIP ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus-within:flex flex-col items-center z-30"
        role="tooltip"
      >
        <span className="relative z-10 p-2 text-xs leading-none text-white bg-zinc-950 dark:bg-zinc-800 border border-zinc-800 rounded-lg shadow-md whitespace-nowrap">
          {content}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-zinc-950 dark:bg-zinc-800 border-r border-b border-zinc-800"></div>
      </div>
    </div>
  );
};
