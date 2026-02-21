import React from 'react';

interface OptimizedLogoProps {
  type: 'text' | 'anvil';
  size?: number;
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

export const OptimizedLogo: React.FC<OptimizedLogoProps> = ({
  type,
  size = 256,
  className = '',
  alt = '',
  loading = 'lazy',
  style = {}
}) => {
  const baseName = type === 'text' ? 'text-logo' : 'anvil-logo';
  
  // Determine the best size based on the requested size
  const getBestSize = () => {
    if (size <= 64) return 64;
    if (size <= 128) return 128;
    if (size <= 256) return 256;
    return 1024;
  };
  
  const bestSize = getBestSize();
  
  return (
    <picture className={className} style={style}>
      {/* Modern browsers with WebP support */}
      <source
        srcSet={`/logos/${baseName}-${bestSize === 1024 ? '' : `${bestSize}-`}webp`}
        type="image/webp"
      />
      
      {/* Fallback for browsers without WebP support */}
      <source
        srcSet={`/logos/${baseName}-${bestSize === 1024 ? 'optimized' : `${bestSize}`}png`}
        type="image/png"
      />
      
      {/* Final fallback */}
      <img
        src={`/logos/${baseName}-${bestSize === 1024 ? 'optimized' : `${bestSize}`}png`}
        alt={alt || `${type === 'text' ? 'UIForge Text' : 'UIForge Anvil'} Logo`}
        loading={loading}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          maxWidth: '100%',
          height: 'auto',
          ...style
        }}
      />
    </picture>
  );
};

// CSS Background version for use in styled-components or CSS-in-JS
export const getLogoBackground = (type: 'text' | 'anvil', size: number = 256) => {
  const baseName = type === 'text' ? 'text-logo' : 'anvil-logo';
  const bestSize = size <= 128 ? 128 : size <= 256 ? 256 : 1024;
  
  return {
    backgroundImage: `url('/logos/${baseName}-${bestSize === 1024 ? '' : `${bestSize}-`}webp')`,
    backgroundImage: `url('/logos/${baseName}-${bestSize === 1024 ? 'optimized' : `${bestSize}`}png)`, // Fallback
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };
};

// Hook for responsive logo loading
export const useResponsiveLogo = (type: 'text' | 'anvil') => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadLogo = async () => {
      const baseName = type === 'text' ? 'text-logo' : 'anvil-logo';
      
      // Try WebP first
      try {
        const webpUrl = `/logos/${baseName}.webp`;
        const img = new Image();
        img.onload = () => {
          setLogoUrl(webpUrl);
          setIsLoading(false);
        };
        img.onerror = () => {
          // Fallback to PNG
          setLogoUrl(`/logos/${baseName}-optimized.png`);
          setIsLoading(false);
        };
        img.src = webpUrl;
      } catch (error) {
        setLogoUrl(`/logos/${baseName}-optimized.png`);
        setIsLoading(false);
      }
    };
    
    loadLogo();
  }, [type]);
  
  return { logoUrl, isLoading };
};