export function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex size-24 items-center justify-center" aria-label="Embedino splash screen">
        <img alt="Embedino" className="size-16 object-contain" src="/logo.svg" />
      </div>
    </div>
  );
}
