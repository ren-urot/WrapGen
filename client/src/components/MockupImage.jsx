// client/src/components/MockupImage.jsx
export default function MockupImage({ src }) {
  if (!src) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Generate a design to see your mockup here
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="Vehicle wrap mockup"
      className="max-w-full max-h-full object-contain rounded"
    />
  );
}
