import React, { useState, useRef } from "react";
import { AvatarGenerator } from "../components/AvatarGenerator";
import { extractFromImage } from "../utils/extractFromImage";

export default function Home() {
  const [features, setFeatures] = useState({
    skinTone: "#ffcd94",
    hairColor: "#7b4b2a",
    hairStyle: "short" as const, // parents can override
    eyeColor: "#3a75c4",
    eyeShape: "round" as const,
  });
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setBusy(true);
    try {
      const extracted = await extractFromImage(file);
      setFeatures((f) => ({
        ...f,
        skinTone: extracted.skinTone,
        hairColor: extracted.hairColor,
        eyeColor: extracted.eyeColor,
      }));
    } catch (err) {
      alert("Sorry—couldn’t read that image. Try another clear, front-facing photo.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setFeatures({
      skinTone: "#ffcd94",
      hairColor: "#7b4b2a",
      hairStyle: "short",
      eyeColor: "#3a75c4",
      eyeShape: "round",
    });
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem", textAlign: "center" }}>
      <h1>Cartoon Avatar Generator</h1>

      {/* Upload controls */}
      <div style={{ margin: "1rem 0" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          style={{ display: "inline-block" }}
        />
        <button
          onClick={resetAll}
          style={{ marginLeft: 12, padding: "6px 10px", cursor: "pointer" }}
        >
          Generate New
        </button>
      </div>

      {/* Preview uploaded photo (optional) */}
      {previewUrl && (
        <div style={{ margin: "0.5rem 0 1rem" }}>
          <img
            src={previewUrl}
            alt="Uploaded preview"
            style={{ maxWidth: 260, borderRadius: 8, opacity: busy ? 0.6 : 1 }}
          />
          {busy && <div style={{ marginTop: 8 }}>Analyzing photo…</div>}
        </div>
      )}

      {/* Generated avatar */}
      <div style={{ display: "grid", placeItems: "center", minHeight: 240 }}>
        <AvatarGenerator features={features} />
      </div>

      {/* Parent override: hair style */}
      <div style={{ marginTop: "1rem" }}>
        <label style={{ marginRight: 8 }}>Hair Style:</label>
        <select
          value={features.hairStyle}
          onChange={(e) => setFeatures({ ...features, hairStyle: e.target.value as any })}
        >
          <option value="short">Short</option>
          <option value="long">Long</option>
          <option value="curly">Curly</option>
        </select>
      </div>

      <p style={{ marginTop: 16, color: "#555" }}>
        Tip: Use a clear, front-facing photo. This runs entirely in your browser.
      </p>
    </div>
  );
}
