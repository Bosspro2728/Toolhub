"use client"
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname(); // e.g. "/services/whiteboard"
  const segments = pathname.split("/").filter(Boolean); // ["services", "whiteboard"]

  // Build breadcrumb path
  const breadcrumbPaths = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href };
  });

  return (
    <nav className="text-sm text-muted-foreground mb-4">
      <ol className="flex items-center space-x-1">
        <li>
          <Link href="/" className="hover:underline">
            /
          </Link>
        </li>
        {breadcrumbPaths.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center space-x-1">
            <span className="mx-1">›</span>
            <Link
              href={crumb.href}
              className={`hover:underline ${
                index === breadcrumbPaths.length - 1 ? "text-foreground font-medium" : ""
              }`}
            >
              {crumb.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
