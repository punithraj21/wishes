"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  const COUNT = 350;

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 50;
      pos[i3 + 1] = (Math.random() - 0.5) * 50;
      pos[i3 + 2] = (Math.random() - 0.5) * 30 - 10;

      // Subtle warm/cool star colors
      const t = Math.random();
      if (t < 0.3) {
        // Warm golden
        col[i3] = 1;
        col[i3 + 1] = 0.9;
        col[i3 + 2] = 0.7;
      } else if (t < 0.5) {
        // Cool blue
        col[i3] = 0.75;
        col[i3 + 1] = 0.8;
        col[i3 + 2] = 1;
      } else {
        // White
        col[i3] = 1;
        col[i3 + 1] = 1;
        col[i3 + 2] = 1;
      }

      // Much smaller stars — most are tiny, a few slightly bigger
      sz[i] = 0.3 + Math.random() * 1.2;
    }
    return { positions: pos, colors: col, sizes: sz };
  }, []);

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
      arr[i] =
        sizes[i] *
        (0.6 + 0.4 * Math.sin(time * (0.3 + phases[i] * 0.2) + phases[i]));
    }
    sizeAttr.needsUpdate = true;

    // Very slow rotation
    starsRef.current.rotation.y = time * 0.008;
    starsRef.current.rotation.x = Math.sin(time * 0.005) * 0.03;
  });

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
    grad.addColorStop(0.2, "rgba(255,255,255,0.5)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.1)");
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
        opacity={0.6}
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
        camera={{ position: [0, 0, 15], fov: 55 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
      >
        <Stars />
      </Canvas>
    </div>
  );
}
