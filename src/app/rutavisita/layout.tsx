// src/app/rutavisita/layout.tsx
export default function RutaVisitaLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Ruta de Visita</h1>
        <div>{children}</div>
      </div>
    );
  }