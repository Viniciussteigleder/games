import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotate: number;
  size: number;
}

const COLORS = [
  "var(--paint)", "#fbbf24", "#34d399", "#60a5fa",
  "#f472b6", "#a78bfa", "#fb923c", "#4ade80",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 300,
    duration: 900 + Math.random() * 600,
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 6,
  }));
}

interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(generateParticles(48));
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            width: p.size,
            height: p.size,
            "--rotate": `${p.rotate}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
