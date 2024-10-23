// src/app/menu/layout.tsx
export default function MenuLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Menu</h1>
        <div>{children}</div>
      </div>
    );
  }