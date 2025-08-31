import React from "react";

interface TrustIndicator {
  icon: React.ReactNode;
  text: string;
}

interface TrustIndicatorsProps {
  indicators: TrustIndicator[];
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ indicators }) => (
  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
    {indicators.map((indicator, index) => (
      <div key={index} className="flex items-center gap-1">
        {indicator.icon}
        <span>{indicator.text}</span>
      </div>
    ))}
  </div>
);
