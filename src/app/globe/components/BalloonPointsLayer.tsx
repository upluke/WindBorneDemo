'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { InstancedMesh, Matrix4, Vector3 } from 'three';
import { latLonAltToXYZ } from '@/lib/geo/latLonToXYZ';
import type { BalloonPoint } from '@/lib/types';

interface BalloonPointsLayerProps {
  points: BalloonPoint[];
}

export default function BalloonPointsLayer({ points }: BalloonPointsLayerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<BalloonPoint | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<Vector3 | null>(null);
  
  const { camera, gl, raycaster, pointer } = useThree();

  // Update instance matrices when points change
  useEffect(() => {
    if (!meshRef.current || points.length === 0) return;

    const matrix = new Matrix4();
    points.forEach((point, i) => {
      const { x, y, z } = latLonAltToXYZ(point.lat, point.lon, point.altKm);
      matrix.setPosition(x, y, z);
      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [points]);

  // Handle hover detection every frame
  useFrame(() => {
    if (!meshRef.current || points.length === 0) return;

    // Update raycaster for mesh intersection
    raycaster.setFromCamera(pointer, camera);
    
    // Check for intersections
    const intersects = raycaster.intersectObject(meshRef.current, false);

    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      const instanceId = intersects[0].instanceId;
      
      // Only update if different to avoid re-renders
      if (instanceId !== hoveredIndex) {
        setHoveredIndex(instanceId);
        setHoveredPoint(points[instanceId]);
        setHoveredPosition(intersects[0].point);
        gl.domElement.style.cursor = 'pointer';
      }
    } else if (hoveredIndex !== null) {
      setHoveredIndex(null);
      setHoveredPoint(null);
      setHoveredPosition(null);
      gl.domElement.style.cursor = 'grab';
    }
  });

  if (points.length === 0) return null;

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </instancedMesh>

      {/* Hover Tooltip */}
      {hoveredPoint && hoveredPosition && (
        <Html
          position={hoveredPosition}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="bg-zinc-900/95 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs text-white whitespace-nowrap backdrop-blur-sm">
            <div className="font-mono space-y-0.5">
              <div>Lat: {hoveredPoint.lat.toFixed(2)}°</div>
              <div>Lon: {hoveredPoint.lon.toFixed(2)}°</div>
              <div>Alt: {hoveredPoint.altKm.toFixed(1)} km</div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

