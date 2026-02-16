"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface FireworkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  life: number;
  maxLife: number;
  size: number;
}

interface FireworkShell {
  launchPos: THREE.Vector3;
  targetY: number;
  velocity: THREE.Vector3;
  color: THREE.Color;
  exploded: boolean;
  particles: FireworkParticle[];
  life: number;
}

// Create a circular glow texture via canvas
function createCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Radial gradient: bright center fading to transparent
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.15, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.4, "rgba(255,200,100,0.4)");
  gradient.addColorStop(0.7, "rgba(255,100,50,0.1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function FireworksScene({ colors }: { colors: string[] }) {
  const shellsRef = useRef<FireworkShell[]>([]);
  const pointsRef = useRef<THREE.Points>(null);
  const trailPointsRef = useRef<THREE.Points>(null);
  const timerRef = useRef(0);
  const { size } = useThree();

  const MAX_PARTICLES = 2000;
  const MAX_TRAILS = 100;

  const circleTexture = useMemo(() => createCircleTexture(), []);
  const threeColors = useMemo(
    () => colors.map((c) => new THREE.Color(c)),
    [colors],
  );

  // Clean up texture on unmount
  useEffect(() => {
    return () => {
      circleTexture.dispose();
    };
  }, [circleTexture]);

  const createShell = useCallback(() => {
    const aspect = size.width / size.height;
    const x = (Math.random() - 0.5) * 6 * Math.min(aspect, 1.5);
    const color = threeColors[Math.floor(Math.random() * threeColors.length)];

    return {
      launchPos: new THREE.Vector3(x, -6, 0),
      targetY: 1 + Math.random() * 4,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        4 + Math.random() * 2,
        0,
      ),
      color,
      exploded: false,
      particles: [] as FireworkParticle[],
      life: 0,
    } as FireworkShell;
  }, [threeColors, size]);

  const explodeShell = useCallback((shell: FireworkShell) => {
    const count = 80 + Math.floor(Math.random() * 40);
    const pos = shell.launchPos.clone();

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.5 + Math.random() * 3;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed;
      const vz = Math.cos(phi) * speed * 0.3;

      const c = shell.color.clone();
      c.offsetHSL((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.15);

      shell.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(vx, vy, vz),
        color: c,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.8,
        size: 8 + Math.random() * 12,
      });
    }
    shell.exploded = true;
  }, []);

  const { positions, particleColors, sizes } = useMemo(
    () => ({
      positions: new Float32Array(MAX_PARTICLES * 3),
      particleColors: new Float32Array(MAX_PARTICLES * 3),
      sizes: new Float32Array(MAX_PARTICLES),
    }),
    [],
  );

  const { trailPositions, trailColors, trailSizes } = useMemo(
    () => ({
      trailPositions: new Float32Array(MAX_TRAILS * 3),
      trailColors: new Float32Array(MAX_TRAILS * 3),
      trailSizes: new Float32Array(MAX_TRAILS),
    }),
    [],
  );

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    timerRef.current += dt;

    if (timerRef.current > 0.6 + Math.random() * 0.6) {
      timerRef.current = 0;
      if (shellsRef.current.length < 6) {
        shellsRef.current.push(createShell());
      }
    }

    let particleIdx = 0;
    let trailIdx = 0;
    const activeShells: FireworkShell[] = [];

    for (const shell of shellsRef.current) {
      shell.life += dt;

      if (!shell.exploded) {
        shell.launchPos.add(shell.velocity.clone().multiplyScalar(dt));
        shell.velocity.y -= dt * 0.8;

        // Trail sparks for rising shell
        for (let t = 0; t < 3 && trailIdx < MAX_TRAILS; t++) {
          const ti = trailIdx * 3;
          trailPositions[ti] = shell.launchPos.x + (Math.random() - 0.5) * 0.2;
          trailPositions[ti + 1] = shell.launchPos.y - Math.random() * 0.5;
          trailPositions[ti + 2] = shell.launchPos.z;
          trailColors[ti] = 1;
          trailColors[ti + 1] = 0.85;
          trailColors[ti + 2] = 0.4;
          trailSizes[trailIdx] = 4 + Math.random() * 4;
          trailIdx++;
        }

        if (shell.launchPos.y >= shell.targetY || shell.velocity.y <= 0) {
          explodeShell(shell);
        }
      }

      let hasAlive = false;
      for (const p of shell.particles) {
        if (p.life <= 0) continue;
        hasAlive = true;

        p.life -= dt / p.maxLife;
        p.position.add(p.velocity.clone().multiplyScalar(dt));
        p.velocity.y -= dt * 2.0;
        p.velocity.multiplyScalar(0.985);

        if (particleIdx < MAX_PARTICLES) {
          const pi = particleIdx * 3;
          positions[pi] = p.position.x;
          positions[pi + 1] = p.position.y;
          positions[pi + 2] = p.position.z;

          const fade = Math.max(p.life, 0);
          particleColors[pi] = p.color.r * fade;
          particleColors[pi + 1] = p.color.g * fade;
          particleColors[pi + 2] = p.color.b * fade;
          sizes[particleIdx] = p.size * fade;
          particleIdx++;
        }
      }

      if (!shell.exploded || hasAlive) {
        activeShells.push(shell);
      }
    }

    shellsRef.current = activeShells;

    for (let i = particleIdx; i < MAX_PARTICLES; i++) sizes[i] = 0;
    for (let i = trailIdx; i < MAX_TRAILS; i++) trailSizes[i] = 0;

    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.attributes.size.needsUpdate = true;
    }
    if (trailPointsRef.current) {
      const geo = trailPointsRef.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.attributes.size.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Explosion particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute
            attach="attributes-color"
            args={[particleColors, 3]}
          />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          map={circleTexture}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          alphaTest={0.01}
        />
      </points>

      {/* Launch trails */}
      <points ref={trailPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[trailColors, 3]} />
          <bufferAttribute attach="attributes-size" args={[trailSizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          map={circleTexture}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          alphaTest={0.01}
        />
      </points>
    </>
  );
}

interface Fireworks3DProps {
  colors: string[];
}

export default function Fireworks3D({ colors }: Fireworks3DProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <FireworksScene colors={colors} />
      </Canvas>
    </div>
  );
}
