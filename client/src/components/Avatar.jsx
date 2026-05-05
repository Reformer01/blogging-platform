import React from 'react';
import PropTypes from 'prop-types';

/**
 * Avatar Component
 * Circular profile image with fallback
 */
const Avatar = React.forwardRef(
  (
    {
      src,
      alt = 'Avatar',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeVariants = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    const baseStyles = `${sizeVariants[size] || sizeVariants.md} rounded-full bg-slate-700 flex-shrink-0 overflow-hidden`;

    return (
      <img
        ref={ref}
        src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`}
        alt={alt}
        className={`${baseStyles} object-cover ${className}`}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export default Avatar;
