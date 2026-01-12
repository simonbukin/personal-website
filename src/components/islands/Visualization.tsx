import { useState } from "react";
import StrangeAttractor from "./StrangeAttractor";
import FlowField from "./FlowField";

interface Props {
  variant?: "full" | "contained";
}

type VisualizationType = "attractor" | "flowfield";

// TODO: Re-enable flowfield later
const VISUALIZATIONS: VisualizationType[] = ["attractor" /* , "flowfield" */];

function getRandomVisualization(): VisualizationType {
  return VISUALIZATIONS[Math.floor(Math.random() * VISUALIZATIONS.length)];
}

export default function Visualization({ variant = "full" }: Props) {
  // Initialize with random visualization immediately
  const [visualizationType] = useState<VisualizationType>(() => getRandomVisualization());

  // The viz-new event is handled by each visualization internally
  // They handle their own refresh/change behavior

  return (
    <>
      {visualizationType === "attractor" && <StrangeAttractor variant={variant} />}
      {visualizationType === "flowfield" && <FlowField variant={variant} />}
    </>
  );
}
