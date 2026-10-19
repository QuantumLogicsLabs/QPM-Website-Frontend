Every version you publish is permanent. People pin their projects to your version numbers, so those numbers need to tell them what changed.

## Semantic versioning in one minute

QPM uses [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| You changed… | Bump | Example |
|---|---|---|
| A bug fix that doesn't change how anything is called | **PATCH** | `1.4.2` → `1.4.3` |
| A new feature, and existing code still works | **MINOR** | `1.4.3` → `1.5.0` |
| Anything that could break existing code | **MAJOR** | `1.5.0` → `2.0.0` |

Breaking changes include removing or renaming a function, changing its arguments or return value, and raising the minimum Quantum version.

Before `1.0.0`, anything may change. Publish `1.0.0` once you're ready to keep your API stable.

## Releasing an update

1. Make your changes and test them.
2. Update `"version"` in `package.json`.
3. Note what changed in your README or a `CHANGELOG.md`, and call out breaking changes clearly.
4. Preview with `qpm publish --dry-run`, then run `qpm publish`.

If you tag releases in git, use the same number (`git tag v1.5.0`) so the source for each version is easy to find.

## Rules the registry enforces

- **A version can be published only once.** If `1.5.0` has a bug, fix it and publish `1.5.1`. The registry rejects a second `1.5.0`.
- **Only the owner can publish new versions** of a package published while signed in.
- **`latest` is the version you published most recently.** `qpm install <name>` with no version uses it. Publishing a prerelease or a fix for an old major line moves `latest` too, so publish those deliberately.

## Prereleases

Mark versions that aren't ready for everyone with a suffix:

```text
2.0.0-beta.1
2.0.0-rc.1
```

Version ranges skip prereleases, so `^1.5.0` never resolves to `2.0.0-beta.1`. People who want to try a prerelease install it by exact version.

## Depending on other packages

List dependencies in your manifest with a version range. `qpm install <name>` adds one for you.

```json
"dependencies": {
  "quantum-math": "^1.0.0",
  "quantum-strings": "~2.3.0"
}
```

| Range | Accepts | Use when |
|---|---|---|
| `^1.2.0` | `1.2.0` up to, but not including, `2.0.0` | The default. You trust the author to follow semver. |
| `~1.2.0` | `1.2.0` up to, but not including, `1.3.0` | You only want bug fixes. |
| `1.2.0` | Exactly `1.2.0` | You need one known version. |
| `>=1.2.0 <1.5.0` | Anything in that range | You know which versions work. |

Use `^` unless you have a reason not to. Your users get bug fixes without you publishing a new version.
