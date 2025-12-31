'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import EarthSphere from '@/app/globe/components/EarthSphere';

export default function HeroGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.6], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#000000']} />

      {/* Soft lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 2, 3]} intensity={0.8} />

      <Suspense fallback={null}>
        <EarthSphere />
      </Suspense>
    </Canvas>
  );
}