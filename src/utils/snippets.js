import { apiUrl } from "@/api/client";

/** curl command that publishes a tarball with an API token. */
export const publishCurlSnippet = () =>
  [
    `curl -X POST ${apiUrl("/registry/publish")} \\`,
    `  -H "Authorization: Bearer $QPM_TOKEN" \\`,
    `  -F "name=my-package" -F "version=1.0.0" \\`,
    `  -F "file=@my-package-1.0.0.tgz"`,
  ].join("\n");
