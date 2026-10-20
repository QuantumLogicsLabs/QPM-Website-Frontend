// Guide metadata. Bodies live in ./articles/<slug>.md and are loaded only by
// the guide page, so the footer can import this list without the articles.

export const GUIDES = [
  {
    slug: "contributing",
    title: "How to contribute",
    summary: "Every way to help the Quantum ecosystem grow: packages, fixes, docs and the registry itself.",
    minutes: 4,
  },
  {
    slug: "publish-your-first-package",
    title: "Publish your first package",
    summary: "From an empty folder to a live package with qpm init, qpm login and qpm publish.",
    minutes: 5,
  },
  {
    slug: "package-guidelines",
    title: "Package guidelines",
    summary: "Names, READMEs, licenses and what to leave out, so people can find and trust your package.",
    minutes: 4,
  },
  {
    slug: "versioning",
    title: "Versioning and releases",
    summary: "How semantic versions work on QPM, and how to ship updates without breaking anyone.",
    minutes: 4,
  },
  {
    slug: "registry-development",
    title: "Run the registry locally",
    summary: "Set up the QPM website and API on your machine to fix bugs or build features.",
    minutes: 5,
  },
];
