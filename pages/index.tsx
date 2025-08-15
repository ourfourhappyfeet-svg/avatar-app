import React, { useState } from "react";
import { AvatarGenerator } from "../components/AvatarGenerator";

export default function Home() {
  const [features, setFeatures] = useState({
    skinTone: "#ffcd94",
    hairColor: "#7b4b2a",
    hairStyle: "short" as const,
    eyeColor: "#3a75c4",
    eyeShape: "round" as const,
  });

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Cartoon Avatar Generator</h1>
      <AvatarGenerator features={features} />

      <div style={{ marginTop: "1rem" }}>
        <label>Hair Style: </label>
        <select
          value={features.hairStyle}
          onChange={(e) => setFeatures({ ...features, hairStyle: e.target.value as any })}
        >
          <option value="short">Short</option>
          <option value="long">Long</option>
          <option value="curly">Curly</option>
        </select>
      </div>
    </div>
  );
}

