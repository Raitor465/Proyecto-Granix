// src/app/solicitudpago/layout.tsx
export default function solicitudLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Solicitud de Pago</h1>
        <div>{children}</div>
      </div>
    );
  }