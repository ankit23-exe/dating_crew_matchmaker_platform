'use client';

import { useState } from 'react';
import { getInitials } from '@/lib/utils';

interface Props {
  firstName: string;
  lastName: string;
  size?: number;
  variant?: 'rose' | 'gold' | 'muted';
  seed?: string;
}

const gradients = {
  rose: 'linear-gradient(135deg, #C9956A, #6B2D3E)',
  gold: 'linear-gradient(135deg, #C4A96D, #A0714F)',
  muted: 'linear-gradient(135deg, #999, #666)',
};

const avatarUrl = (seed: string, size: number, variant: Props['variant']) => {
  const bg = variant === 'gold' ? 'e8d5a3' : 'f2ede4';
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor: bg,
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params}`;
};

export const ProfileRing = ({
  firstName,
  lastName,
  size = 46,
  variant = 'rose',
  seed,
}: Props) => {
  const [failed, setFailed] = useState(false);
  const avatarSeed = seed ?? `${firstName} ${lastName}`;
  const innerSize = size - 4;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: 2,
        background: gradients[variant],
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'var(--cream-dark)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {failed ? (
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: innerSize * 0.37,
              fontWeight: 500,
              color: variant === 'gold' ? '#8A6020' : 'var(--rose-deep)',
            }}
          >
            {getInitials(firstName, lastName)}
          </span>
        ) : (
          <img
            src={avatarUrl(avatarSeed, innerSize, variant)}
            alt={`${firstName} ${lastName}`}
            width={innerSize}
            height={innerSize}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
};
