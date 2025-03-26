'use client';

import React, { useMemo } from 'react';
import isMobileScreen from '../../utils/isMobileScreen';
import throttle from 'lodash/throttle';


const SvgBreakpoints = [352, 400, 448, 496, 544, 592]
function getBestFitWidth(windowWidth: number, breakpoints: number[]) {
  return breakpoints.reduce((prev, curr) => {
    return (curr <= windowWidth) ? curr : prev;
  }, 592);
}

const adapt = (cuts: number) => {
  const pathBottom = "C40.8 392.047 47.2471 385.6 55.2 385.6C63.1529 385.6 69.6 392.047 69.6 400H88.8C88.8 392.047 95.2471 385.6 103.2 385.6C111.153 385.6 117.6 392.047 117.6 400H136.8C136.8 392.047 143.247 385.6 151.2 385.6C159.153 385.6 165.6 392.047 165.6 400H184.8C184.8 392.047 191.247 385.6 199.2 385.6C207.153 385.6 213.6 392.047 213.6 400H232.8C232.8 392.047 239.247 385.6 247.2 385.6C255.153 385.6 261.6 392.047 261.6 400H280.8C280.8 392.047 287.247 385.6 295.2 385.6C303.153 385.6 309.6 392.047 309.6 400H328.8C328.8 392.047 335.247 385.6 343.2 385.6C351.153 385.6 357.6 392.047 357.6 400H376.8C376.8 392.047 383.247 385.6 391.2 385.6C399.153 385.6 405.6 392.047 405.6 400H424.8C424.8 392.047 431.247 385.6 439.2 385.6C447.153 385.6 453.6 392.047 453.6 400H472.8C472.8 392.047 479.247 385.6 487.2 385.6C495.153 385.6 501.6 392.047 501.6 400H520.8"
  const pathRight = "C520.8 392.047 527.247 385.6 535.2 385.6C543.153 385.6 549.6 392.047 549.6 400H568.8C570.567 400 572 398.567 572 396.8V132.8C564.047 132.8 557.6 126.353 557.6 118.4C557.6 110.447 564.047 104 572 104V19.2C572 17.4327 570.567 16 568.8 16";
  const pathSegments = pathBottom.match(/C[\d.\s]+C[\d.\s]+H\d+\.\d+/g);
  new Array(cuts).fill(0).forEach(() => {
    if (pathSegments!.length > 0) {
      pathSegments!.pop()
    }
  })
  const adjustment = (10 - pathSegments!.length) * 48;
  const adjustedRight = pathRight!.replace(/H(\d+\.\d+)/g, (match, p1) => {
    return `H${parseFloat(p1) - adjustment}`;
  }).replace(/C([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/g, (match, x1, y1, x2, y2, x3, y3) => {
    return `C${(parseFloat(x1) - adjustment).toFixed(3)} ${y1} ${(parseFloat(x2) - adjustment).toFixed(3)} ${y2} ${(parseFloat(x3) - adjustment).toFixed(3)} ${y3}`;
  });
  return pathSegments!.join('') + adjustedRight + "H23.2Z";
}

const BgSvg: React.FC = () => {
  const isMobile = isMobileScreen();
  const offset = isMobile ? 0 : 40
  const [width, setWidth] = React.useState<number>(480);
  React.useEffect(() => {
    const handleResize = throttle(() => {
      const newWidth = getBestFitWidth(window.innerWidth - offset, SvgBreakpoints)
      if (newWidth !== width) {
        setWidth(newWidth)
      }
    }, 200)
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
    }
  }, [width, offset]);

  const finalPathString = useMemo(() => {
    const n = SvgBreakpoints.slice().reverse().findIndex(x => x === width)
    return adapt(n === -1 ? 5 : n)
  }, [width]);
  return (
    <svg width={width} height={423} className={"absolute -mt-7 left-1/2 transform -translate-x-1/2"} fill="none"
         xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_843_281)">
        <path fillRule="evenodd" clipRule="evenodd"
              d={"M23.2 16C21.4327 16 20 17.4327 20 19.2V104C27.9529 104 34.4 110.447 34.4 118.4C34.4 126.353 27.9529 132.8 20 132.8V396.8C20 398.567 21.4327 400 23.2 400H40.8" + finalPathString}
              fill="white"/>
        <path d={`M52 119H${width - 50}`} stroke="#00112C" strokeOpacity="0.2" strokeLinecap="round" strokeDasharray="4 4"/>
        <rect width={width - offset} transform="translate(20 16)" height="10" fill="#00112C20"/>
      </g>
      <defs>
        <filter id="filter0_d_843_281" x="0.799999" y="-7.15256e-07" width="590.4" height="422.4"
                filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                         result="hardAlpha"/>
          <feOffset dy="3.2"/>
          <feGaussianBlur stdDeviation="9.6"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.0666667 0 0 0 0 0.172549 0 0 0 0.08 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_281"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_281" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
};

export default BgSvg;
