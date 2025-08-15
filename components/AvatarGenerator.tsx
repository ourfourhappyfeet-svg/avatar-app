import React from "react";

type Features = {
  skinTone: string;
  hairColor: string;
  hairStyle: "short" | "long" | "curly";
  eyeColor: string;
  eyeShape: "round" | "almond";
};

export const AvatarGenerator: React.FC<{ features: Features }> = ({ features }) => {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill={features.skinTone} />
      {features.hairStyle === "short" && (
        <rect x="20" y="20" width="160" height="40" fill={features.hairColor} />
      )}
      {features.hairStyle === "long" && (
        <rect x="10" y="20" width="180" height="100" fill={features.hairColor} />
      )}
      {features.hairStyle === "curly" && (
        <circle cx="100" cy="40" r="60" fill={features.hairColor} />
      )}
      <circle cx="70" cy="100" r="10" fill={features.eyeColor} />
      <circle cx="130" cy="100" r="10" fill={features.eyeColor} />
    </svg>
  );
};

