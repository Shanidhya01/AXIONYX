import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;