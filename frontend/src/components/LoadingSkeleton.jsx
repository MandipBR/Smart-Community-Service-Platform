export default function LoadingSkeleton({ className = "h-24 w-full", count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton rounded-[14px] ${className}`} />
      ))}
    </>
  );
}
