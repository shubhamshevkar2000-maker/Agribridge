export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="p-8 glass-card border-border/50 rounded-2xl max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-heading font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          This feature is currently under development. Please check back later in the next phase!
        </p>
      </div>
    </div>
  );
}
