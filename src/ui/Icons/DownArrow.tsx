import * as React from 'react';

export const DownArrow = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF726E"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="0" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  );
};
