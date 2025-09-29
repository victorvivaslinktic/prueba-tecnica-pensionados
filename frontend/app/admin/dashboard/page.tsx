export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-foreground/70">Ruta protegida. Estás autenticado</p>
    </main>
  );
}
