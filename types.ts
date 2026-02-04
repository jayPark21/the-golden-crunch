
export interface Particle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  color: string;
  angle: number;
  velocity: number;
  phase: number;
}

export interface SectionProps {
  headline: string;
  sub: string;
  progress: number;
  start: number;
  end: number;
}
