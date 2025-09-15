import React from "react";

export default function CustomNode({ nodeDatum, onSelect }) {
  const truncated =
    nodeDatum.name.length > 12 ? nodeDatum.name.slice(0, 10) + "…" : nodeDatum.name;

  console.log("Rendering node:", nodeDatum.name);

  return (
    <g onClick={() => {toggleNode(); onSelect(nodeDatum.name);}} style={{ cursor: "pointer" }}>
      <circle r={40} fill="#fff" stroke="#fff" strokeWidth={2} />
      <text
        textAnchor="middle"
        alignmentBaseline="middle"
        style={{ fill: "#fff", fontFamily: "Sansation", fontSize: 12 }}
      >
        {truncated}
      </text>
    </g>
  );
}

/*
onClick function:
    if i'm a root node, 
*/
