import React from 'react';
import './BrokenGearAnimation.css';

/**
 * Bulletproof 1:2 Ratio Gear Animation.
 * Uses outer fixed translation containers and inner (0,0) rotating groups.
 * Ensures gears stay 100% stationary in place while rotating/struggling.
 */
const BrokenGearAnimation = () => {
  return (
    <div className="cracked-gear-wrapper" aria-label="Struggling 1:2 ratio broken gear animation">
      {/* Radial aura glow */}
      <div className="cracked-gear-aura"></div>

      <svg
        className="cracked-gear-svg"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 12-Tooth Red Gear Gradient */}
          <linearGradient id="mainGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="60%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Secondary 6-Tooth Amber Gear Gradient */}
          <linearGradient id="secGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Axle Hub Gradient */}
          <linearGradient id="axleHubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Lightning Glow for Crack */}
          <filter id="crackLightningGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* SECONDARY 6-TOOTH GEAR CONTAINER (Fixed at 135, 65) */}
        <g transform="translate(135, 65)">
          {/* INNER ANIMATED GROUP: Rotates around (0,0) */}
          <g className="struggling-sec-gear-group">
            {/* 6-Tooth Pitch Matched Silhouette */}
            <path
              fill="url(#secGearGrad)"
              d="M 16.27 -6.44 L 24.45 -5.20 L 24.45 5.20 L 16.27 6.44 L 13.71 10.87 L 16.73 18.58 L 7.73 23.78 L 2.56 17.31 L -2.56 17.31 L -7.73 23.78 L -16.73 18.58 L -13.71 10.87 L -16.27 6.44 L -24.45 5.20 L -24.45 -5.20 L -16.27 -6.44 L -13.71 -10.87 L -16.73 -18.58 L -7.73 -23.78 L -2.56 -17.31 L 2.56 -17.31 L 7.73 -23.78 L 16.73 -18.58 L 13.71 -10.87 Z"
            />

            {/* Inner spoke holes */}
            <circle cx="0" cy="-10" r="3" fill="#0f172a" />
            <circle cx="8.66" cy="5" r="3" fill="#0f172a" />
            <circle cx="-8.66" cy="5" r="3" fill="#0f172a" />

            {/* Secondary Axle Hub */}
            <circle cx="0" cy="0" r="7" fill="url(#axleHubGrad)" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* MAIN 12-TOOTH CRACKED GEAR CONTAINER (Fixed at 90, 110) */}
        <g transform="translate(90, 110)">
          {/* INNER ANIMATED GROUP: Rotates around (0,0) */}
          <g className="struggling-main-gear-group">
            {/* 12-Tooth Pitch Matched Silhouette */}
            <path
              fill="url(#mainGearGrad)"
              d="M 34.38 -6.56 L 49.73 -5.23 L 49.73 5.23 L 34.38 6.56 L 33.05 11.51 L 45.68 20.34 L 40.45 29.39 L 26.49 22.87 L 22.87 26.49 L 29.39 40.45 L 20.34 45.68 L 11.51 33.05 L 6.56 34.38 L 5.23 49.73 L -5.23 49.73 L -6.56 34.38 L -11.51 33.05 L -20.34 45.68 L -29.39 40.45 L -22.87 26.49 L -26.49 22.87 L -40.45 29.39 L -45.68 20.34 L 33.05 -11.51 L -34.38 6.56 L -49.73 5.23 L -49.73 -5.23 L -34.38 -6.56 L -33.05 -11.51 L -45.68 -20.34 L -40.45 -29.39 L -26.49 -22.87 L -22.87 -26.49 L -29.39 -40.45 L -20.34 -45.68 L -11.51 -33.05 L -6.56 -34.38 L -5.23 -49.73 L 5.23 -49.73 L 6.56 -34.38 L 11.51 -33.05 L 20.34 -45.68 L 29.39 -40.45 L 22.87 -26.49 L 26.49 -22.87 L 40.45 -29.39 L 45.68 -20.34 L 33.05 -11.51 Z"
            />

            {/* 4 Concentric Spoke Window Cutouts */}
            <circle cx="0" cy="-22" r="6" fill="#0f172a" />
            <circle cx="22" cy="0" r="6" fill="#0f172a" />
            <circle cx="0" cy="22" r="6" fill="#0f172a" />
            <circle cx="-22" cy="0" r="6" fill="#0f172a" />

            {/* Chipped Tooth Gap at upper right fracture site */}
            <polygon points="23,-28 47,-22 30,-11" fill="#0f172a" />

            {/* Fractured Crack Line through main gear face */}
            <path
              d="M 5 -48 L 12 -25 L 2 -4 L 18 16 L 28 42"
              stroke="#0f172a"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing yellow fracture core */}
            <path
              d="M 5 -46 L 12 -25 L 2 -4 L 18 16 L 28 40"
              stroke="#fef08a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#crackLightningGlow)"
              className="crack-glow-line"
            />

            {/* Main Axle Hub */}
            <circle cx="0" cy="0" r="16" fill="url(#axleHubGrad)" stroke="#ef4444" strokeWidth="2" />
            <circle cx="0" cy="0" r="9" fill="#0f172a" />
            <circle cx="0" cy="0" r="4" fill="#ef4444" />
          </g>
        </g>

        {/* Friction Sparks at Meshing Point (Fixed at 122, 82) */}
        <g transform="translate(122, 82)">
          <g className="jam-sparks">
            <circle cx="0" cy="0" r="2.5" fill="#fef08a" className="jam-spark spark-a" />
            <circle cx="6" cy="-8" r="2" fill="#fbbf24" className="jam-spark spark-b" />
            <line x1="-2" y1="2" x2="8" y2="-6" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" className="jam-spark spark-c" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BrokenGearAnimation;
