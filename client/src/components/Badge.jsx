import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component
 * Status indicator for published, draft, featured states
 */
const Badge = React.forwardRef(
  (
    {
      children,
      status = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300';

    const statusStyles = {
      published: 'bg-emerald-900/50 text-emerald-200 border border-emerald-700/50',
      draft: 'bg-amber-900/50 text-amber-200 border border-amber-700/50',
      featured: 'bg-accent-dark/30 text-accent-light border border-accent-base/50',
      default: 'bg-slate-700 text-slate-200 border border-slate-600',
    };

    const finalClassName = `${baseStyles} ${statusStyles[status] || statusStyles.default} ${className}`;

    return (
      <span ref={ref} className={finalClassName} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  status: PropTypes.oneOf(['published', 'draft', 'featured', 'default']),
  className: PropTypes.string,
};

export default Badge;
