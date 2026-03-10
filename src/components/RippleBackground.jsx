import React from "react";

const RippleBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-blue-50">

      <div className="ripple-bg">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
};

export default RippleBackground;