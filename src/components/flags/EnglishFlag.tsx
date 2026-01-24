"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface EnglishFlagProps {
  onClick: () => void;
  isActive: boolean;
}

const EnglishFlag: React.FC<EnglishFlagProps> = ({ onClick, isActive }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={cn(
        "flag-icon-container group",
        isActive && "flag-icon-active"
      )}
      aria-label={t("common.english")}
    >
      <svg viewBox="0 0 60 30" width="24" height="12" className="flag-icon">
        <rect width="60" height="30" fill="#00247d" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" strokeWidth="4" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#cf142b" strokeWidth="6" />
      </svg>
    </button>
  );
};

export default EnglishFlag;