'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconClassName?: string;
}

const sizeConfig = {
  xs: { dim: 24, classes: 'w-6 h-6 text-xs', icon: 'w-3 h-3' },
  sm: { dim: 32, classes: 'w-8 h-8 text-xs', icon: 'w-4 h-4' },
  md: { dim: 44, classes: 'w-11 h-11 text-sm', icon: 'w-5 h-5' },
  lg: { dim: 48, classes: 'w-12 h-12 text-base', icon: 'w-6 h-6' },
  xl: { dim: 80, classes: 'w-20 h-20 text-xl', icon: 'w-9 h-9' },
};

export default function UserAvatar({
  src,
  alt = 'User',
  size = 'md',
  className = '',
  iconClassName = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const cfg = sizeConfig[size] || sizeConfig.md;

  const showImage = Boolean(src && !imgError);

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 flex items-center justify-center relative select-none ${cfg.classes} ${
        showImage ? 'bg-gray-100' : 'bg-emerald-50 border border-emerald-200/70 text-forest'
      } ${className}`}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          width={cfg.dim}
          height={cfg.dim}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          unoptimized={typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:'))}
        />
      ) : (
        <User className={`${cfg.icon} text-forest stroke-[1.8] ${iconClassName}`} />
      )}
    </div>
  );
}
