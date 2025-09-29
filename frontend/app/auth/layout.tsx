export const metadata = { title: "Auth | MyApp" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[calc(100vh-56px)] grid place-items-center px-4 py-6">
      <div className="w-full max-w-md">{children}</div>
    </section>
  );
}
