'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useState, useMemo } from 'react';
import useSWR from 'swr';
import EarthSphere from './components/EarthSphere';
import BalloonPointsLayer from './components/BalloonPointsLayer';
import TrailsLayer from './components/TrailsLayer';
import ControlsPanel from './components/ControlsPanel';
import { matchTracks } from '@/lib/windborne/trackMatching';
import type { BalloonsApiResponse, BalloonPoint } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobeScene() {
  const [selectedHour, setSelectedHour] = useState(0);
  
  const { data, error, isLoading } = useSWR<BalloonsApiResponse>(
    '/api/balloons?hours=24',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: false,
    }
  );

  // Get balloons for selected hour
  const currentBalloons: BalloonPoint[] = data?.snapshots
    .find((snap) => snap.tHoursAgo === selectedHour)?.balloons || [];

  // Compute tracks from all snapshots
  const tracks = useMemo(() => {
    if (!data?.snapshots || data.snapshots.length === 0) return [];
    return matchTracks(data.snapshots);
  }, [data?.snapshots]);

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <ControlsPanel
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          isLoading={isLoading}
          error={error}
          totalSnapshots={data?.snapshots.length || 0}
          balloonCount={currentBalloons.length}
        />
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#000000']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1} />
          
          {/* Scene Elements */}
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            <EarthSphere />
            <TrailsLayer tracks={tracks} selectedHour={selectedHour} maxHours={24} />
            <BalloonPointsLayer points={currentBalloons} />
          </Suspense>
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            zoomSpeed={0.5}
          />
        </Canvas>

        {/* Loading/Error Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-white text-lg">Loading balloon data...</div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-red-400 text-lg">Failed to load data</div>
          </div>
        )}
      </div>
    </div>
  );
}

