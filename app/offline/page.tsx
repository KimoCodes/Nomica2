export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
        <p className="text-muted-foreground">
          It looks like you&apos;ve lost your internet connection.
          Don&apos;t worry — your progress is saved locally.
        </p>
        <p className="text-sm text-muted-foreground">
          When you&apos;re back online, your data will sync automatically.
        </p>
      </div>
    </div>
  );
}
