import React from 'react';

const SpinnerAudio = () => {
  // Animation styles moved to inline styles using keyframes API
  const scaleLoadKeyframes = `
    @keyframes scaleLoad {
      0%, 49.9% {
        transform: translateY(0) scaleY(0);
        transform-origin: top;
      }
      25% {
        transform: translateY(0) scaleY(1);
      }
      50%, 100% {
        transform: translateY(-100%) scaleY(0);
        transform-origin: bottom;
      }
      75% {
        transform: translateY(-100%) scaleY(1);
      }
    }
  `;

  // Common styles for all bars
  const barStyle = {
    width: '0.375rem',
    height: '2rem',
    borderRadius: '9999px',
    display: 'inline-block',
    marginRight: '0.375rem',
    background: 'linear-gradient(to bottom, #002865, #00112C)',
    animation: 'scaleLoad 1.5s ease-in-out infinite'
  };

  // Create bar elements with different delays
  const createBar = (delay: number, margin?: string) => ({
    ...barStyle,
    animationDelay: `${delay}s`,
    ...(margin && { marginLeft: margin, marginRight: margin })
  });

  const bars = [
    createBar(0),
    createBar(0.1),
    createBar(0.2, '0.5rem'),
    createBar(0.3),
    createBar(0.4),
    { ...createBar(0.5), marginRight: 0 } // Last bar has no right margin
  ];

  return (
    <div className="relative h-64 w-64 grid place-content-center">
      <style>{scaleLoadKeyframes}</style>
      
      {/* Spinning circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <svg
          width={216}
          height={216}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
        >
          <circle cx="108" cy="108" r="104" fill="none" strokeWidth="6" stroke="#EBECEE"/>
          <path
            d="M108 3.24c0-1.79 1.451-3.245 3.24-3.191A108 108 0 0 1 215.951 104.76c.054 1.789-1.402 3.24-3.191 3.24s-3.235-1.451-3.292-3.24A101.517 101.517 0 0 0 111.24 6.532C109.451 6.475 108 5.029 108 3.24"
            fill="#00112C"
          />
          <circle cx={108} cy={108} r={65} fill="#E5E7EA" />
        </svg>
      </div>
      
      {/* Loading bars */}
      <div className="transform translate-y-1/2">
        {bars.map((style, index) => (
          <span key={index} style={style}></span>
        ))}
      </div>
    </div>
  );
};

export default SpinnerAudio;