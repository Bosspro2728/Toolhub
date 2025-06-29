 // app/services/layout.tsx
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/layout/bread-crumbs";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumbs visible on all nested pages */}
      <Breadcrumbs />

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
