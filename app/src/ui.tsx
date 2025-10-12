import React from "react";

/* === Container principal === */
export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      {children}
    </div>
  );
}

/* === Seções com título === */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* === Card (caixa branca com sombra) === */
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {children}
    </div>
  );
}

/* === Corpo do Card (padding interno) === */
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4 md:p-6">{children}</div>;
}

/* === Input (campo de formulário) === */
export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-gray-300 px-3 py-2 " +
        "focus:outline-none focus:ring-2 focus:ring-emerald-300 " +
        (props.className || "")
      }
    />
  );
}

/* === Badge (selos coloridos) === */
type BadgeColor = "emerald" | "red" | "gray";

export function Badge({
  children,
  color = "emerald",
}: {
  children: React.ReactNode;
  color?: BadgeColor;
}) {
  const map: Record<BadgeColor, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${map[color]}`}
    >
      {children}
    </span>
  );
}

