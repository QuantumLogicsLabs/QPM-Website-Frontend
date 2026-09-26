import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileArchive, HardDrive } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import GithubIcon from "@/components/ui/GithubIcon";
import PageMeta from "@/components/ui/PageMeta";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import GithubImportForm from "./GithubImportForm";
import PublishTips from "./PublishTips";
import UploadForm from "./UploadForm";
import styles from "./Publish.module.css";

const METHODS = [
  { id: "upload", label: "Upload tarball", icon: FileArchive },
  { id: "github", label: "Import from GitHub", icon: GithubIcon },
];

const BRAND_COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#10b981"];

export default function Publish() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const method = params.get("from") === "github" ? "github" : "upload";

  const selectMethod = (id) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (id === "github") next.set("from", "github");
        else next.delete("from");
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const handlePublished = useCallback(
    ({ name, version }) => {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.65 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
      });
      toast.success(`${name}@${version} is live on the registry.`, { title: "Package published" });
      navigate(`/package/${encodeURIComponent(name)}`);
    },
    [navigate, toast],
  );

  return (
    <div className="container page">
      <PageMeta title="Publish a package" />

      <header className={styles.header}>
        <Badge tone="cyan" icon={HardDrive}>
          Stored on Google Drive
        </Badge>
        <h1 className={styles.title}>Publish a package</h1>
        <p className={styles.lead}>
          Upload a tarball or import straight from a public GitHub repository. Every version is
          archived in Google Drive and served to the <code>qpm</code> CLI.
        </p>
        {user && (
          <p className={styles.publisher}>
            <Avatar name={user.username} size={24} />
            Publishing as <strong>@{user.username}</strong>
          </p>
        )}
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Tabs idPrefix="publish" label="Publishing method" tabs={METHODS} value={method} onChange={selectMethod} />
          {/* Both forms stay mounted so switching tabs never loses what was typed. */}
          <div hidden={method !== "upload"}>
            <TabPanel idPrefix="publish" id="upload" className={cn("surface", styles.panel)}>
              <UploadForm initialName={params.get("name") ?? ""} onPublished={handlePublished} />
            </TabPanel>
          </div>
          <div hidden={method !== "github"}>
            <TabPanel idPrefix="publish" id="github" className={cn("surface", styles.panel)}>
              <GithubImportForm onPublished={handlePublished} />
            </TabPanel>
          </div>
        </div>

        <PublishTips />
      </div>
    </div>
  );
}
