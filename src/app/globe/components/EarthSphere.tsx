'use client';

import { useRef } from 'react';
import { Mesh, BackSide } from 'three';
import { useTexture } from '@react-three/drei';

/**
 * Earth sphere component with texture and atmosphere
 * Radius of 1 matches the normalized coordinates from latLonAltToXYZ
 */
export default function EarthSphere() {
  const meshRef = useRef<Mesh>(null);
  
  // Load Earth texture - NASA Blue Marble (natural colors, 2K resolution)
  const earthTexture = useTexture('https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg');

  return (
    <group>
      {/* Main Earth sphere with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Atmosphere glow - inner layer */}
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial
          color="#40c0ff"
          transparent
          opacity={0.25}
          side={BackSide}
        />
      </mesh>

      {/* Atmosphere glow - outer layer for smooth gradient */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial
          color="#40c0ff"
          transparent
          opacity={0.12}
          side={BackSide}
        />
      </mesh>
    </group>
  );
}

