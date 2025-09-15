import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineInput from "./components/input.jsx";

function App() {
  const navigate = useNavigate();

  const handleArtistSubmit = (artist) => {
  if (!artist) return; // ignore empty input

  // Encode artist name for URL (spaces → %20, etc.)
  const encodedArtist = encodeURIComponent(artist.trim());

  // Redirect to /music-tree/:artistName
  navigate(`/music-tree/${encodedArtist}`);
  };

  return (
    <div style={{ padding: "2rem" }} class="parent">
      <h1>Rootify</h1>
      <InlineInput onSubmit={handleArtistSubmit} />
    </div>

  );
}

export default App;