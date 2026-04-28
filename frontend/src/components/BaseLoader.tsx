'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface BaseLoaderProps {
  fullScreen?: boolean;
  size?: number;
  text?: string;
}

export default function BaseLoader({ 
  fullScreen = false, 
  size = 40,
  text = 'Loading...'
}: BaseLoaderProps) {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center text-primary" style={{ gap: '1rem' }}>
      <Loader2 size={size} className="animate-spin" />
      {text && <span className="fw-medium text-muted">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        {content}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center p-4 w-100 h-100">
      {content}
    </div>
  );
}
