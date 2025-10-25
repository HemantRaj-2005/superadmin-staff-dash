// components/Avatar.js
import React, { useState } from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-24 w-24 text-lg'
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const DefaultAvatar = () => (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-br from-blue-500 to-purple-600 
        flex items-center justify-center 
        text-white font-semibold
        shadow-md
        ${className}
      `}
    >
      {getInitials(alt)}
    </div>
  );

  if (!src || imageError) {
    return <DefaultAvatar />;
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        className={`
          rounded-full object-cover border-2 border-white shadow-md
          ${sizeClasses[size]}
          transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        src={src}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
          <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;