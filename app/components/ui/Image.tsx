import { useState, type ImgHTMLAttributes } from 'react';
import { classNames } from '~/utils/classNames';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export function Image({ src, alt, className, fallback, ...props }: ImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <>{fallback || <div className={classNames('i-ph:user-fill', className)} />}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
