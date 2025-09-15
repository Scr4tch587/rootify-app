import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";
import './MusicTreePage.css';
import ForceGraph2D from 'react-force-graph-2d';
import { createRoot } from 'react-dom/client';
import React from 'react';
import * as d3 from "d3-force";

function MusicTreePage() {
    const { artistName } = useParams();
    //const [data, setData] = useState(null);
    const artist = decodeURIComponent(artistName);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [data, setData] = useState(null);
    const fgRef = useRef();

    useEffect(() => {
    if (fgRef.current) {
        fgRef.current.d3Force("charge", d3.forceManyBody().strength(-800));
        const linkForce = fgRef.current.d3Force("link");
        if (linkForce) linkForce.distance(1000);

        fgRef.current.d3ReheatSimulation();
    }
    }, [graphData]);

    useEffect(() => {
        import("./data.json", { assert: { type: "json" } })
        .then((module) => {
            const jsonData = module.default;
            setData(jsonData);

            // if your JSON has an "artist" field
            const rootArtist = jsonData.artist;
            const nodeToFix = jsonData.nodes.find(n => n.id === rootArtist);
            if (nodeToFix) {
                nodeToFix.fx = nodeToFix.x || 0; // fix x
                nodeToFix.fy = nodeToFix.y || 0; // fix y
                nodeToFix.size = 20; // bigger radius
            }

            // if your JSON already has nodes/links, populate graph
            if (jsonData.nodes && jsonData.links) {
            setGraphData(cloneDeep(jsonData));
            }
        })
        .catch((err) => console.error("Failed to load JSON:", err));
    }, []);
    
    // useEffect(() => {
    // axios
    //     .get(`/music-tree/${encodeURIComponent(artist)}`)
    //     .then((res) => {
    //     console.log("Response type:", typeof res.data);
    //     console.log("Response data:", res.data);
    //     console.log("Creating tree for " + artist);
    //     setData(cloneDeep(res.data));
    //     const rootArtist = data["artist"];
    //     })
    //     .catch((err) => console.error(err));
    // }, [artist]);

    const [selectedArtist, setSelectedArtist] = useState(null);
    const handleSelectArtist = (artist) => setSelectedArtist(artist);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111111" }}>
        <div style={{ flex: 4, height: '100vh', width: '100%' }}>
        {data ? (
        <ForceGraph2D
          graphData={graphData}
          ref={fgRef}
          linkColor={() => '#fff'}
          linkWidth={1.5}
          nodeAutoColorBy="group"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 25/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            //ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(label, node.x, node.y);
            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
          }}
        />
        ) : (
        <p style={{ color: '#fff' }}>Loading tree for {artist}...</p>
        )}
        </div>
        <div style={{ flex: 1, padding: "1rem", color: "white", background: "#1e1e1f" }}>
            {selectedArtist ? <h2>{selectedArtist}</h2> : <p>click a node for details</p>}
        </div>
    </div>
  );
}

export default MusicTreePage;


    // const secondaryNodes = data?.children ?? [];
    // console.log("secondaryNodes", secondaryNodes);
    // const angleIterator = 360 / secondaryNodes.length;
    // const containerRef = useRef(null);
        // secondaryNodes.map((subTree, i) => {
        //     const angle = i * angleIterator;
        //     const cx = containerRef.current?.clientWidth / 2 ?? 0;
        //     const cy = 100;


            //         return (
            // <svg width="100%" height="100%">
            //     <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
            //         <Tree
            //             data={subTree}
            //             orientation="horizontal"
            //             translate={{ x: cx, y: cy }}
            //             renderCustomNodeElement={(props) => <CustomNode {...props} onSelect={handleSelectArtist} />}
            //             pathFunc="straight"
            //             depthFactor={399}
            //             pathProps={{
            //                 stroke: "red",        // try bright red to confirm
            //                 strokeWidth: 3,
            //                 fill: "none",
            //             }}
            //             styles={{
            //                 nodes: {
            //                 node: {
            //                     circle: { fill: "#4caf50", stroke: "#fff", strokeWidth: 2 },
            //                     name:  { fill: "#111111", fontFamily: "Sansation, sans-serif", fontSize: "14px" },
            //                     attributes: { fill: "#ffffff" },
            //                 },
            //                 },
            //                 links: { stroke: "#fff", strokeWidth: 2 },
            //             }}
            //             separation={{ siblings: 0.7, nonSiblings: 0.5 }} 
            //             collapsible={true}
            //         />          
            //     </g>
            // </svg>
            // );