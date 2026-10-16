import { isRouteErrorResponse, useRouteError } from "react-router";
import { House, RefreshCw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageMeta from "@/components/ui/PageMeta";

// A failed lazy import usually means a new deploy replaced the old chunks.
const isChunkLoadError = (error) =>
  error instanceof TypeError && /dynamically imported module|Importing a module script failed/i.test(error.message);

export default function RouteError() {
  const error = useRouteError();

  let title = "Something went wrong";
  let description = "An unexpected error occurred while rendering this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description = typeof error.data === "string" ? error.data : description;
  } else if (isChunkLoadError(error)) {
    title = "A new version is available";
    description = "The registry was updated while you had it open. Reload to get the latest version.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="container page">
      <PageMeta title={title} />
      <EmptyState titleAs="h1" icon={TriangleAlert} tone="danger" title={title} description={description}>
        <Button to="/" variant="secondary" icon={House}>
          Go home
        </Button>
        <Button icon={RefreshCw} onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </EmptyState>
    </div>
  );
}
