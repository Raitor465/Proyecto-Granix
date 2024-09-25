// src/app/login/layout.tsx
export default function Login({ children }: { children: React.ReactNode }) {
    return (
       <div>
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <div>{children}</div>
       </div>
    );
  }