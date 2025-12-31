'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * Earth sphere component with simple material
 * Radius of 1 matches the normalized coordinates from latLonAltToXYZ
 */
export default function EarthSphere() {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#1a4d80"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

