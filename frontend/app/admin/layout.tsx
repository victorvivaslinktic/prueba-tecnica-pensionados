export const metadata = { title: "Admin | MyApp" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      {children}
    </section>
  );
}
