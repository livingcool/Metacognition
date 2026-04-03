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
      className={`text-white transition-all duration-700 ${className}`}
      {...props}
    >
      <defs>
        {/* The single 'Neural Fold' petal path */}
        <path 
          id="neural-petal" 
          d="M 50 42 C 50 15, 85 15, 80 45 C 75 75, 55 65, 50 42" 
        />
      </defs>

      {/* 6-fold rotational symmetry */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <use xlinkHref="#neural-petal" transform="rotate(0, 50, 50)" />
        <use xlinkHref="#neural-petal" transform="rotate(60, 50, 50)" />
        <use xlinkHref="#neural-petal" transform="rotate(120, 50, 50)" />
        <use xlinkHref="#neural-petal" transform="rotate(180, 50, 50)" />
        <use xlinkHref="#neural-petal" transform="rotate(240, 50, 50)" />
        <use xlinkHref="#neural-petal" transform="rotate(300, 50, 50)" />
      </g>
    </svg>
  );
};

