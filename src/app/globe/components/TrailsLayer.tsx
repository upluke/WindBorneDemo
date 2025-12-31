'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { latLonAltToXYZ } from '@/lib/geo/latLonToXYZ';
import type { Track } from '@/lib/types';

interface TrailsLayerProps {
  tracks: Track[];
  selectedHour: number;
  maxHours?: number;
  maxTrails?: number; // Performance: Cap number of trails rendered
}

/**
 * Render balloon trails showing motion history over time
 * 
 * @param tracks - Array of balloon tracks from matchTracks
 * @param selectedHour - Currently selected time (0 = now, 23 = 23h ago)
 * @param maxHours - Maximum hours to display (default 24)
 * @param maxTrails - Maximum trails to render for performance (default 500)
 * 
 * @remarks
 * - Only renders trail segments up to selectedHour
 * - Trails are visible with bright cyan color and moderate opacity
 * - Shows best-effort motion history for balloon constellation
 * - Performance: Caps trail count and decimates if needed to prevent stutter
 */
export default function TrailsLayer({ 
  tracks, 
  selectedHour,
  maxHours = 24,
  maxTrails = 500 // Performance: Limit to 500 trails for smooth rendering
}: TrailsLayerProps) {
  // Filter and convert tracks to 3D line segments
  const trailLines = useMemo(() => {
    // Performance: Decimate tracks if we have too many
    // Take every Nth track to maintain even distribution
    const decimationFactor = Math.max(1, Math.ceil(tracks.length / maxTrails));
    const decimatedTracks = decimationFactor > 1
      ? tracks.filter((_, i) => i % decimationFactor === 0)
      : tracks;

    return decimatedTracks.map((track) => {
      // Only show trails for balloons that exist at the selected hour
      const hasPointAtSelectedHour = track.points.some(
        (p) => p.tHoursAgo === selectedHour
      );
      
      // Skip this track if no balloon exists at selected time
      if (!hasPointAtSelectedHour) return null;

      // Filter points: only show points from past up to selectedHour
      // selectedHour=0 means "now", so show all points from past to now
      // selectedHour=5 means "5h ago", so show points from past up to 5h ago
      const filteredPoints = track.points.filter(
        (p) => p.tHoursAgo >= selectedHour && p.tHoursAgo < maxHours
      );

      // Need at least 2 points to draw a line
      if (filteredPoints.length < 2) return null;

      // Convert to 3D coordinates
      const points = filteredPoints.map((tp) => {
        const { x, y, z } = latLonAltToXYZ(
          tp.point.lat,
          tp.point.lon,
          tp.point.altKm
        );
        return [x, y, z] as [number, number, number];
      });

      return {
        id: track.id,
        points,
      };
    }).filter((line): line is NonNullable<typeof line> => line !== null);
  }, [tracks, selectedHour, maxHours, maxTrails]);

  if (trailLines.length === 0) return null;

  // Performance: Log if trails were decimated (dev mode only)
  if (process.env.NODE_ENV === 'development' && tracks.length > maxTrails) {
    console.log(`TrailsLayer: Decimated ${tracks.length} tracks to ${trailLines.length} for performance`);
  }

  return (
    <group>
      {trailLines.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color="#39FF14"
          lineWidth={2.0}
          opacity={0.6}
          transparent
          dashed={false}
        />
      ))}
    </group>
  );
}

