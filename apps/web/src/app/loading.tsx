import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Logo with pulse animation */}
        <div className="animate-pulse">
          <Image src="/siza-icon.png" alt="Siza" width={48} height={48} className="flex-shrink-0" />
        </div>

        {/* Loading spinner */}
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
