import React from 'react';

const PageTransition = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out',
    fade: 'animate-in fade-in duration-400 ease-in-out',
    slideUp: 'animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out',
    slideRight: 'animate-in fade-in slide-in-from-left-6 duration-500 ease-out',
    slideLeft: 'animate-in fade-in slide-in-from-right-6 duration-500 ease-out',
    zoom: 'animate-in fade-in zoom-in-95 duration-400 ease-out',
  };

  return (
    <div className={`${variants[variant]} w-full h-full`}>
      {children}
    </div>
  );
};

export default PageTransition;