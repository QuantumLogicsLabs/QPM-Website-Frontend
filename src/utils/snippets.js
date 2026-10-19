import { apiUrl } from "@/api/client";

/** The qpm commands that publish the package in the current folder; `comments` explain each one. */
export const qpmPublishSnippet = ({ comments = true } = {}) =>
  (comments
    ? [
        "qpm login     # once per computer: paste your API token",
        "qpm init      # once per package: writes package.json",
        "qpm publish",
      ]
    : ["qpm login", "qpm init", "qpm publish"]
  ).join("\n");

/** curl command that publishes a tarball with an API token. */
export const publishCurlSnippet = () =>
  [
    `curl -X POST ${apiUrl("/registry/publish")} \\`,
    `  -H "Authorization: Bearer $QPM_TOKEN" \\`,
    `  -F "name=my-package" -F "version=1.0.0" \\`,
    `  -F "file=@my-package-1.0.0.tgz"`,
  ].join("\n");
