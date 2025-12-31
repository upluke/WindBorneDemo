'use client';

interface ControlsPanelProps {
  selectedHour: number;
  onHourChange: (hour: number) => void;
  isLoading: boolean;
  error: any;
  totalSnapshots: number;
  balloonCount: number;
}

export default function ControlsPanel({
  selectedHour,
  onHourChange,
  isLoading,
  error,
  totalSnapshots,
  balloonCount,
}: ControlsPanelProps) {
  return (
    <div className="flex flex-col h-full p-6 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          WindBorne Demo
        </h1>
        <p className="text-sm text-zinc-400">
          Live balloon constellation
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Status:</span>
          <span className={isLoading ? "text-yellow-400" : error ? "text-red-400" : "text-green-400"}>
            {isLoading ? "Loading..." : error ? "Error" : "Live"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Snapshots:</span>
          <span className="text-white font-mono">{totalSnapshots}/24</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Balloons:</span>
          <span className="text-white font-mono">{balloonCount}</span>
        </div>
      </div>

      {/* Time Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-zinc-300">
            Time Offset
          </label>
          <span className="text-sm font-mono text-zinc-400">
            {selectedHour === 0 ? 'Now' : `${selectedHour}h ago`}
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="23"
          value={selectedHour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          disabled={isLoading || error}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
        />
        
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>Now</span>
          <span>23h ago</span>
        </div>
      </div>

      {/* Play/Pause Button (Placeholder) */}
      <div className="mb-6">
        <button
          className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors border border-zinc-700 disabled:cursor-not-allowed"
          disabled={true}
        >
          ⏸ Pause Animation
        </button>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          (Animation coming in M3)
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-auto pt-6 border-t border-zinc-800">
        <div className="space-y-3 text-xs text-zinc-400">
          <div>
            <span className="font-medium text-zinc-300">Navigation:</span>
            <ul className="mt-1 space-y-1 ml-2">
              <li>• Drag to rotate</li>
              <li>• Scroll to zoom</li>
              <li>• Hover balloons for info</li>
            </ul>
          </div>
          
          <div className="pt-3 border-t border-zinc-800">
            <p className="text-zinc-500">
              Data updates every 60s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

