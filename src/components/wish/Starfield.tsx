"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  const COUNT = 600;

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 40;
      pos[i3 + 1] = (Math.random() - 0.5) * 40;
      pos[i3 + 2] = (Math.random() - 0.5) * 20 - 5;

      // Warm twinkling colors
      const t = Math.random();
      if (t < 0.3) {
        col[i3] = 1;
        col[i3 + 1] = 0.85;
        col[i3 + 2] = 0.6;
      } else if (t < 0.6) {
        col[i3] = 0.8;
        col[i3 + 1] = 0.7;
        col[i3 + 2] = 1;
      } else {
        col[i3] = 1;
        col[i3 + 1] = 1;
        col[i3 + 2] = 1;
      }

      sz[i] = 1 + Math.random() * 3;
    }
    return { positions: pos, colors: col, sizes: sz };
  }, []);

  // Pre-store random phases for twinkling
  const phases = useMemo(() => {
    const p = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) p[i] = Math.random() * Math.PI * 2;
    return p;
  }, []);

  useFrame((state) => {
    if (!starsRef.current) return;
    const time = state.clock.elapsedTime;
    const sizeAttr = starsRef.current.geometry.attributes.size;
    const arr = sizeAttr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      // Twinkle effect
      arr[i] =
        sizes[i] *
        (0.5 + 0.5 * Math.sin(time * (0.5 + phases[i] * 0.3) + phases[i]));
    }
    sizeAttr.needsUpdate = true;

    // Slow rotation
    starsRef.current.rotation.y = time * 0.02;
    starsRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
  });

  // Circular texture
  const texture = useMemo(() => {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
      >
        {/* <Stars /> */}
      </Canvas>
    </div>
  );
}
