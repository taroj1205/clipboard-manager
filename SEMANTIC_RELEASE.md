# Semantic Release Setup

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases based on conventional commits.

## Migration from Changesets

We've migrated from Changesets CLI to semantic-release for the following benefits:

- **Automatic versioning**: Based on conventional commit messages
- **Automated changelog generation**: No manual changeset files needed
- **GitHub releases**: Automatic creation of GitHub releases
- **Tauri integration**: Automatic version syncing for Cargo.toml and package.json

## Development Workflow

### Recommended Branch Strategy

1. **Feature Development**: Work on feature branches, merge to `develop`
   ```bash
   # Create feature branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b feat/clipboard-search
   
   # Make your changes with conventional commits
   git commit -m "feat: add clipboard history search functionality"
   git commit -m "fix: resolve search performance issue"
   git commit -m "docs: update search API documentation"
   
   # Create PR: feature branch → develop
   git push origin feat/clipboard-search
   ```

2. **Integration Testing**: Accumulate features on `develop` branch
   ```bash
   # Multiple features get merged to develop
   # Test them together before release
   # develop branch contains "release candidate" code
   ```

3. **Ready for Release**: Create PR from `develop` → `main`
   ```bash
   # Create PR: develop → main
   # Review all accumulated changes since last release
   # Merge when ready to trigger release
   ```

4. **Automatic Draft Release**: When PR is merged to `main`
   - semantic-release analyzes all commits since last release
   - Creates version bump, changelog, git tag, **draft GitHub release**
   - Tauri builds and attaches binaries to the draft release
   - **You manually publish the release when ready**

5. **Sync Back**: After release, sync changes back to develop
   ```bash
   # Sync main → develop (develop gets release commits)
   git checkout develop
   git pull origin main
   git push origin develop
   ```

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature (triggers minor version bump)
- `fix:` - A bug fix (triggers patch version bump)
- `perf:` - Performance improvements (triggers patch version bump)
- `refactor:` - Code refactoring (triggers patch version bump)
- `build:` - Build system changes (triggers patch version bump)
- `docs:` - Documentation changes (no release)
- `style:` - Code style changes (no release)
- `test:` - Test changes (no release)
- `chore:` - Maintenance tasks (no release)
- `ci:` - CI/CD changes (no release)

## What Gets Updated Automatically

When a release is triggered, semantic-release will:

1. **Analyze commits** to determine the release type
2. **Generate version number** based on semantic versioning
3. **Update package.json** with the new version
4. **Update Cargo.toml** in src-tauri/ with the new version
5. **Update Cargo.lock** to reflect Cargo.toml changes
6. **Generate CHANGELOG.md** with release notes
7. **Create Git tag** and **GitHub release**
8. **Build and attach** Tauri application binaries to the release

## Scripts

- `pnpm semantic-release` - Run semantic-release (used in CI)
- `pnpm semantic-release:dry` - Test semantic-release locally without making changes

### Breaking Changes

Add `BREAKING CHANGE:` in the commit body or use `!` after the type to trigger a major version bump:

```
feat!: remove deprecated API
```

or

```
feat: add new authentication system

BREAKING CHANGE: The old auth API has been removed
```

## Release Process

1. **Automatic Draft Releases**: When you push to the `main` branch, semantic-release will:
   - Analyze commits since the last release
   - Generate release notes
   - Update version in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
   - Create a new tag and **draft GitHub release**
   - Update the `CHANGELOG.md`
   - Build and attach Tauri application binaries

2. **Manual Release Publishing**: 
   - Go to your GitHub repository's Releases page
   - Find the draft release created by semantic-release
   - Review the release notes and attached binaries
   - Click "Publish release" when ready

3. **Manual Testing**: Run `pnpm semantic-release:dry` to test what would be released without actually releasing.

## Migration from Changesets

This project was migrated from Changesets CLI to semantic-release. The key differences:

- **Before**: Manual changeset files → `changeset version` → `changeset publish`
- **After**: Conventional commits → automatic releases on main branch push

## Tauri Integration

The semantic-release configuration is specifically tailored for Tauri apps:

- Synchronizes versions across `package.json`, `tauri.conf.json`, and `Cargo.toml`
- Updates `Cargo.lock` automatically
- Integrates with GitHub releases
- Maintains changelog in conventional format
