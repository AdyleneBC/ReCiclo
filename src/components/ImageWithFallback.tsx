import { useState } from 'react';
import { Sprout } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F7F8F6] text-[#6E9167] border border-[#E4E7E3] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sprout className="w-7 h-7 mb-1.5 opacity-80" />
        <span className="text-xs text-[#6C736C] px-3 text-center line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
    />
  );
}
