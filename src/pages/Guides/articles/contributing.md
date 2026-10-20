The registry is only as useful as what people put into it. You don't need to be a compiler engineer to help. Most contributions are small: one package, one fixed typo, one clearer error message.

## Ways to contribute

### Publish a package

The most direct way to grow the ecosystem. If you wrote a helper you keep copying between projects (string utilities, a date parser, a test runner), turn it into a package so nobody has to write it again.

Start with [Publish your first package](/guides/publish-your-first-package), then read the [package guidelines](/guides/package-guidelines) before you share it.

### Improve an existing package

Every package page links to its repository when the author added one. From there you can:

- **Report a bug.** Open an issue with the package version, what you ran, what you expected and what happened.
- **Send a fix.** Fork the repository, make the change, and open a pull request. Small, focused pull requests get merged fastest.
- **Improve the README.** Examples, a clearer API list, or a note about a gotcha you hit are all welcome.

If a package has no repository link and you need changes, you can publish a clearly named alternative. Credit the original and respect its license.

### Contribute to the registry

The website and API you're using right now are open source. Bug fixes, accessibility improvements, better search and new features are all welcome.

| Repository | What lives there |
|---|---|
| [QPM-Website](https://github.com/QuantumLogicsLabs/QPM-Website) | Meta-repo that ties the two services together |
| [QPM-Website-Frontend](https://github.com/QuantumLogicsLabs/QPM-Website-Frontend) | This site: React 19, Vite, CSS Modules |
| [QPM-Website-Backend](https://github.com/QuantumLogicsLabs/QPM-Website-Backend) | Registry API: Express, MongoDB, Google Drive storage |

[Run the registry locally](/guides/registry-development) walks through the setup.

### Contribute to Quantum Language

The language, its compiler and the `qpm` CLI live in the [Quantum Language repository](https://github.com/SENODROOM/QuantumLanguage). Its `docs/CONTRIBUTING.md` covers building the compiler and testing your changes.

### Improve these guides

These guides are Markdown files in the frontend repository under `src/pages/Guides/articles/`. If something here is wrong, unclear or missing, edit the file and open a pull request.

## The pull request workflow

All the repositories above follow the same flow:

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<you>/QPM-Website-Frontend.git
cd QPM-Website-Frontend

# 2. Work on a branch
git checkout -b fix/search-empty-state

# 3. Commit with a short, descriptive message
git commit -m "fix: show the empty state when search has no results"

# 4. Push and open a pull request against main
git push origin fix/search-empty-state
```

A few habits make reviews quick:

- **One change per pull request.** A bug fix and an unrelated refactor belong in two pull requests.
- **Explain the why.** Say what was broken or missing and how you checked your change.
- **Run the checks.** For the frontend, `npm run lint` and `npm run build` should pass before you push.
- **Include screenshots** for visual changes, in both light and dark themes.

## Reporting problems

- **Registry bugs** (the site or the API): open an issue on the frontend or backend repository.
- **Package bugs**: open an issue on that package's repository.
- **Security issues**: don't open a public issue. Contact the maintainers privately so the problem can be fixed before it's disclosed.

## Be kind

Everyone here is volunteering their time. Assume good intent, keep feedback about the code rather than the person, and help newcomers the way you'd have wanted to be helped.
