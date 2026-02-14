import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/data": "Data Management",
  "/search": "Search",
  "/chat": "Chat",
  "/admin": "Admin",
};

export function Header() {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const title = pageTitles[basePath] || "LocalRAG";

  return (
    <header className="flex h-14 items-center border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
