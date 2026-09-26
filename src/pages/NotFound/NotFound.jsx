import { Compass, House, MapPinOff } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageMeta from "@/components/ui/PageMeta";

export default function NotFound() {
  return (
    <div className="container page">
      <PageMeta title="Page not found" />
      <EmptyState
        icon={MapPinOff}
        title="This page doesn't exist"
        description="The link may be broken, or the page may have moved. Try searching the registry instead."
      >
        <Button to="/" variant="secondary" icon={House}>
          Go home
        </Button>
        <Button to="/explore" icon={Compass}>
          Explore packages
        </Button>
      </EmptyState>
    </div>
  );
}
