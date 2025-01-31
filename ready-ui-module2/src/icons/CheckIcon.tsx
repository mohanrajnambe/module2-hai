import React from 'react';

export const CheckIcon: React.FC<{ size?: number; fill?: string; className?: string }> = ({
  size = 24,
  fill = "currentColor",
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    stroke={fill}
  >
    <path
      d="M5 13l4 4L19 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export default CheckIcon;
