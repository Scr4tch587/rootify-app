import { useState, useRef, useEffect } from "react";
import "./input.css";

export default function InlineInput({ onSubmit }) {
  const [artist, setArtist] = useState("");
  const spanRef = useRef(null);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(artist.trim());
    }
  };

  const [inputWidth, setInputWidth] = useState(1);

  useEffect(() => {
    if (spanRef.current) {
      // Measure the width of the text and add a tiny buffer
      const width = spanRef.current.offsetWidth + 2;
      setInputWidth(width);
    }
  }, [artist]);

  return (
    <div className="page-container">
      <div className="inline-input-wrapper">
        <span className="inline-text">enter a music artist:</span>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          className="inline-textbox"
          autoFocus
          style={{ width: `${inputWidth}px` }}
        />
        {/* Hidden span to measure text width */}
        <span
          ref={spanRef}
          className="inline-text-measure"
          style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}
        >
          {artist || " "}
        </span>
      </div>
    </div>
  );
}
