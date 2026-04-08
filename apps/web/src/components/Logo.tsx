import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo = ({ size = 32, className = '' }: LogoProps) => {
  return (
    <Image 
      src="/logo.png"
      alt="Mirror Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
};

