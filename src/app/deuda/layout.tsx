// src/app/deuda/layout.tsx
export default function deudaLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Deudas Pendientes</h1>
        <div>{children}</div>
      </div>
    );
  }