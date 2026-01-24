"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TurkishFlagProps {
  onClick: () => void;
  isActive: boolean;
}

const TurkishFlag: React.FC<TurkishFlagProps> = ({ onClick, isActive }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={cn(
        "flag-icon-container group",
        isActive && "flag-icon-active"
      )}
      aria-label={t("common.turkish")}
    >
      <svg viewBox="0 0 60 30" width="24" height="12" className="flag-icon">
        <rect width="60" height="30" fill="#e30a17" />
        <circle cx="22.5" cy="15" r="7.5" fill="#fff" />
        <circle cx="24.375" cy="15" r="6" fill="#e30a17" />
        <path d="M30,15 A6,6 0 0 1 30,15" fill="#fff" transform="translate(3.75,0)" />
        <path d="M30,15 L33.75,16.18 L32.34,12.5 L36.09,11.32 L32.34,10.14 L33.75,6.46 L30,7.64 L26.25,6.46 L27.66,10.14 L23.91,11.32 L27.66,12.5 L26.25,16.18 Z" fill="#fff" transform="translate(11.25,0) scale(0.5)" />
        <path d="M30,15 L33.75,16.18 L32.34,12.5 L36.09,11.32 L32.34,10.14 L33.75,6.46 L30,7.64 L26.25,6.46 L27.66,10.14 L23.91,11.32 L27.66,12.5 L26.25,16.18 Z" fill="#fff" transform="translate(11.25,0) scale(0.5)" />
        <path d="M30,15 L33.75,16.18 L32.34,12.5 L36.09,11.32 L32.34,10.14 L33.75,6.46 L30,7.64 L26.25,6.46 L27.66,10.14 L23.91,11.32 L27.66,12.5 L26.25,16.18 Z" fill="#fff" transform="translate(11.25,0) scale(0.5)" />
        <path d="M30,15 L33.75,16.18 L32.34,12.5 L36.09,11.32 L32.34,10.14 L33.75,6.46 L30,7.64 L26.25,6.46 L27.66,10.14 L23.91,11.32 L27.66,12.5 L26.25,16.18 Z" fill="#fff" transform="translate(11.25,0) scale(0.5)" />
        <path d="M30,15 L33.75,16.18 L32.34,12.5 L36.09,11.32 L32.34,10.14 L33.75,6.46 L30,7.64 L26.25,6.46 L27.66,10.14 L23.91,11.32 L27.66,12.5 L26.25,16.18 Z" fill="#fff" transform="translate(11.25,0) scale(0.5)" />
      </svg>
    </button>
  );
};

export default TurkishFlag;