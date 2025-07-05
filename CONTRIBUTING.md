# Contributing to Clipboard Manager

Thank you for your interest in contributing to Clipboard Manager! This document provides guidelines and instructions for contributing.

## 🎯 How Can I Contribute?

### Reporting Bugs

- Use the bug report template when creating a new issue
- Include as much detail as possible
- Include steps to reproduce the issue
- Include screenshots if applicable

### Suggesting Features

- Use the feature request template
- Explain why this feature would be useful
- Include any mockups or examples if possible

### Pull Requests

1. Fork the repository
2. Create a new branch from main
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-branch-name
   ```
3. Make your changes
4. Follow our commit message convention (see below)
5. Submit a pull request targeting the `main` branch

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Here are the types of commits we accept:

- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A performance improvement
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

Example:

```
feat: add dark mode support
fix: resolve clipboard sync issue
docs: update installation instructions
```

## 🛠 Development Setup

1. Clone the repository:

```bash
git clone https://github.com/taroj1205/clipboard-manager.git
cd clipboard-manager
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun run dev
```

## 🧪 Testing

Before submitting a pull request, please ensure:

- All tests pass
- New features have corresponding tests
- Code follows the project's style guidelines

## 📚 Documentation

- Keep documentation up to date
- Add comments to complex code sections
- Update README.md if necessary

## 🤝 Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## 📝 License

By contributing to this project, you agree that your contributions will be licensed under the project's license.
