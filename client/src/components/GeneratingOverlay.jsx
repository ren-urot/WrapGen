// client/src/components/GeneratingOverlay.jsx
export default function GeneratingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/80 z-10 gap-4">
      <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin" />
      <p className="text-electric font-semibold text-sm tracking-wide">Generating your wrap design...</p>
      <p className="text-gray-500 text-xs">This takes 10–20 seconds</p>
    </div>
  );
}
