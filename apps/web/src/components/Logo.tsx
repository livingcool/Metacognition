import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Logo = ({ size = 32, className = '', ...props }: LogoProps) => {
  return (
    <svg 
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-violet-400 ${className}`}
      {...props}
    >
      <path 
        d="M20 50 C20 15, 80 15, 80 50 C80 85, 50 85, 50 50 C50 15, 20 15, 20 50" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

