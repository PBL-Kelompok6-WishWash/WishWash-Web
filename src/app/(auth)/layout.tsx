// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen w-full bg-white flex flex-col">
      {children}
    </section>
  );
}