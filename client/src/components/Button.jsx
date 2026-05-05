import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component
 * Premium button with 3 variants: Primary (Electric Blue), Secondary (Slate), Ghost (Outline)
 */
const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2';

    // Size variants
    const sizeVariants = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-7 py-3.5 text-lg',
    };

    // Color variants
    const colorVariants = {
      primary: `bg-accent-base hover:bg-accent-light active:scale-[0.98] text-white focus-visible:outline-accent-base disabled:opacity-50 disabled:cursor-not-allowed`,
      secondary: `bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-slate-200 focus-visible:outline-slate-600 disabled:opacity-50 disabled:cursor-not-allowed`,
      ghost: `border border-slate-600 hover:bg-slate-800 active:scale-[0.98] text-slate-200 focus-visible:outline-slate-600 disabled:opacity-50 disabled:cursor-not-allowed`,
    };

    const finalClassName = `${baseStyles} ${sizeVariants[size] || sizeVariants.md} ${colorVariants[variant] || colorVariants.primary} ${className}`;

    return (
      <button
        ref={ref}
        className={finalClassName}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
