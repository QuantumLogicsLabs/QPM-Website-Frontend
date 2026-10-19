A package is a promise to the people who install it. These guidelines help people find your package, understand it in a minute, and trust it in their projects.

## Pick a clear name

The name is the first thing people search for and the last thing you can change. Once you publish while signed in, it belongs to your account.

- **Say what it does.** `quantum-csv` beats `qcsv-lib-v2`.
- **Use the allowed characters.** Lowercase letters, numbers, `-`, `.` and `_`, starting with a letter or number.
- **Don't squat.** Publish a name when you have working code for it, not to reserve it.
- **Don't impersonate.** Avoid names that look like an existing package or that suggest an official project you're not part of.

## Write a README that answers three questions

Your `README.md` becomes the package page. A reader should learn three things in under a minute: **what it does**, **how to install it**, and **how to use it**.

````markdown
# quantum-csv

Read and write CSV files from Quantum.

## Install

```bash
qpm install quantum-csv
```

## Usage

```python
# @use quantum-csv

let rows = Csv.parse("name,age\nAda,36")
print(rows)
```

## API

- `Csv.parse(text)`: rows as objects keyed by the header
- `Csv.stringify(rows)`: back to CSV text

## License

MIT
````

GitHub-flavoured Markdown works: tables, task lists and fenced code blocks. Raw HTML isn't rendered, so stick to Markdown.

## Fill in the manifest

Search matches **names, descriptions and keywords**, so these fields decide whether people find you.

- **`description`**: one plain sentence, shown in search results.
- **`keywords`**: three to eight words people would actually type, such as `csv`, `parser` or `files`.
- **`repository`**: link your source so people can report bugs and send fixes.
- **`license`**: without one, people can't legally use your code. `MIT` is a common, permissive choice. Ship the matching `LICENSE` file too.

## Ship only what's needed

`qpm publish` packs your folder, so check what goes in. Always run `qpm publish --dry-run` first and read the file list.

`qpm` always **includes** `package.json`, the README, the LICENSE and your `main` file. It always **leaves out** version-control folders, `node_modules`, `quantum_qubits`, lockfiles and `.npmrc` / `.qpmrc`.

For everything else, pick one approach:

- **An allowlist (recommended).** List what to ship in `"files"`. Anything not listed stays out.
  ```json
  "files": ["index.sa", "lib/", "README.md"]
  ```
- **An ignore file.** Add a `.qpmignore` with `.gitignore` syntax. If there's no `.qpmignore`, qpm uses `.npmignore`, then `.gitignore`.

> **Never publish secrets.** A `.env` file, API keys or private config are not excluded by default. Published versions can't be overwritten, so a leaked secret has to be rotated, not deleted.

## Keep it small and focused

- **Do one thing well.** Two unrelated features belong in two packages.
- **Minimise dependencies.** Every dependency is something your users also install and trust.
- **Stay well under the 100 MB limit.** Leave out build outputs, test fixtures and large assets.

## Test before every release

If your manifest has a `test` script, run `qpm run test` before publishing. Install your package into a fresh folder with `qpm install <name>` at least once to check that it really works for someone who doesn't have your source tree.

## Be a good maintainer

- Respond to issues, even if only to say you can't fix something soon.
- Note breaking changes clearly when you release them. See [Versioning and releases](/guides/versioning).
- If you stop maintaining a package, say so at the top of the README so people can move on.
