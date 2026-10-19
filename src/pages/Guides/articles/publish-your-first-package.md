This guide takes a small Quantum module from your machine to the registry. It takes about five minutes, and you only set up your login once.

## Before you start

You need:

- The `qpm` CLI, which ships with Quantum Language. Check it's installed with `qpm --version`.
- A QPM account. Use **Sign up** in the top bar of this site. You can publish as a guest, but anyone could then publish over your package name, so signing in is strongly recommended.

## 1. Write your module

Make a folder for your package and put your code in it. By convention the entry point is `index.sa`:

```text
quantum-greet/
├── index.sa
└── README.md
```

```python
# index.sa
class __Greet {
    fn hello(name) {
        return "Hello, " + name + "!"
    }
}

Greet = __Greet()
```

## 2. Create the manifest

From inside the folder, run:

```bash
qpm init
```

`qpm init` asks for the common fields and writes a `package.json`. Press Enter to accept a suggested value, or run `qpm init -y` to skip the questions and accept every default.

```json
{
  "name": "quantum-greet",
  "version": "1.0.0",
  "description": "Friendly greetings for Quantum programs.",
  "main": "index.sa",
  "keywords": ["quantum", "greeting", "strings"],
  "license": "MIT",
  "files": ["index.sa", "README.md"]
}
```

| Field | What it's for |
|---|---|
| `name` | The install name. Lowercase letters, numbers, `-`, `.` and `_` only. |
| `version` | A semantic version such as `1.0.0`. See [Versioning and releases](/guides/versioning). |
| `description` | One line, shown in search results. |
| `main` | The file other programs load. Always included in the package. |
| `keywords` | Words people might search for. |
| `files` | An allowlist of what to ship. Without it, everything not ignored is packed. |

## 3. Log in once

Open your [profile](/profile), copy your **API token**, and run:

```bash
qpm login
```

Paste the token when asked. `qpm` saves it, so you won't need to log in again on this computer. Run `qpm whoami` to check it worked.

Your API token doesn't expire. If it ever leaks, regenerate it from your profile and every old copy stops working.

## 4. Preview, then publish

See exactly what will be uploaded, without uploading anything:

```bash
qpm publish --dry-run
```

Check the file list. If you see build outputs, secrets or large assets, add a `files` list or a `.qpmignore` (see the [package guidelines](/guides/package-guidelines)). When it looks right:

```bash
qpm publish
```

Your package is live. Find it on [Explore](/explore), or open `/package/<name>` directly.

## 5. Use it

In any other project:

```bash
qpm install quantum-greet
```

Quantum packages install into `./quantum_qubits` and are added to that project's manifest. Load one at the top of a `.sa` file:

```python
# @use quantum-greet

print(Greet.hello("world"))   # Hello, world!
```

## Publishing from the website instead

Prefer not to use the terminal? The [Publish](/publish) page offers two other routes:

- **Upload a tarball.** Run `qpm pack` to produce `<name>-<version>.tgz`, then upload it with the version and details filled in.
- **Import from GitHub.** Paste a public repository URL. The registry downloads the branch you choose (default `main`), reads `README.md` for the package page, and takes the name, description and keywords from a `qpm.json` at the repository root if there is one. Otherwise the name comes from the repository.

## Limits to know about

- Each archive can be at most **100 MB**.
- Each version can be published **once**. To fix a mistake, publish a new version.
- When you publish while signed in, the package name is **locked to your account**. Nobody else can publish new versions of it.
