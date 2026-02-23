export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">QR Food Ordering System</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to the QR Food Ordering System
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/customer"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Customer View
          </a>
          <a
            href="/admin"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
