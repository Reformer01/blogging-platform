import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component
 * Liquid glass effect with subtle elevation and hover scale
 */
const Card = React.forwardRef(
  (
    {
      children,
      className = '',
      variant = 'default',
      hoverable = true,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg backdrop-blur-md border border-white/10 transition-all duration-500';

    const variantStyles = {
      default: 'bg-slate-800/80 shadow-sm hover:shadow-medium',
      elevated: 'bg-slate-800/90 shadow-medium hover:shadow-prominent',
      dark: 'bg-slate-900/80 shadow-subtle hover:shadow-medium',
    };

    const hoverStyles = hoverable
      ? 'group overflow-hidden hover:scale-105 hover:border-accent-base/30'
      : '';

    const finalClassName = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${className}`;

    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'dark']),
  hoverable: PropTypes.bool,
};

export default Card;
