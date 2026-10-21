import React from 'react';

interface BunkerLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BunkerLogo: React.FC<BunkerLogoProps> = ({
  className = '',
  variant = 'light',
  showSubtitle = false,
  size = 'md',
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FAFAF8' : '#17191D';
  const subtitleColor = isLight ? '#9CA3AF' : '#68707D';

  const sizeClasses = {
    sm: 'h-6 text-lg',
    md: 'h-8 text-2xl',
    lg: 'h-10 text-3xl',
    xl: 'h-12 text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none font-black tracking-tight ${className}`}>
      {/* Original Solid Vault Glyph */}
      <svg
        className={sizeClasses[size].split(' ')[0]}
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Heavy Hexagonal Vault Shape */}
        <path
          d="M19 2L35 11.2376V26.7624L19 36L3 26.7624V11.2376L19 2Z"
          fill={isLight ? '#282C33' : '#17191D'}
          stroke={isLight ? '#3F444E' : '#282C33'}
          strokeWidth="2"
        />
        {/* Stylized Heavy B inside */}
        <path
          d="M12 10H21.5C24.5376 10 27 12.0147 27 14.5C27 16.2415 25.8078 17.7317 24.0326 18.4237C26.3683 19.1558 28 20.9126 28 23C28 25.7614 25.3137 28 22 28H12V10Z"
          fill={textColor}
        />
        {/* Cutouts for B */}
        <rect x="16" y="13" width="5" height="4" rx="1" fill={isLight ? '#282C33' : '#17191D'} />
        <rect x="16" y="21" width="5.5" height="4" rx="1" fill={isLight ? '#282C33' : '#17191D'} />
        {/* Dynamic Orange Energy Accent Corner */}
        <path
          d="M29 6L35 11.2376L29 14"
          stroke="#F28C28"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-black uppercase tracking-wider ${sizeClasses[size].split(' ')[1]}`}
          style={{
            color: textColor,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '0.08em',
          }}
        >
          BUNKER<span className="text-[#F28C28]">.</span>
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-semibold -mt-1"
            style={{ color: subtitleColor }}
          >
            Original Gear & Audio
          </span>
        )}
      </div>
    </div>
  );
};
