# Contributing to MCP Server Template

Thank you for considering contributing to the MCP Server Template! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots or code snippets (if applicable)
- Environment information (OS, Node.js version, etc.)

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue with the following information:

- A clear, descriptive title
- A detailed description of the enhancement
- Any relevant examples or mockups
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the coding style and conventions used in the project
- Include tests for new features or bug fixes
- Update documentation as needed
- Keep pull requests focused on a single change
- Link to relevant issues or discussions

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy the example environment file: `cp .env.example .env`
4. Build the project: `npm run build`
5. Run tests: `npm test`

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use strict type checking
- Avoid using `any` type when possible
- Use interfaces for data structures
- Document public APIs with JSDoc comments

### Testing

- Write tests for all new features and bug fixes
- Maintain high test coverage
- Test both success and error cases
- Mock external dependencies

### Documentation

- Update documentation for any changes to the API
- Document new features and changes in behavior
- Keep code comments up to date
- Use clear, descriptive variable and function names

## Git Workflow

- Use descriptive commit messages
- Reference issues in commit messages when applicable
- Keep commits focused on a single change
- Rebase your branch before submitting a pull request

## Release Process

The maintainers will handle the release process, which includes:

1. Updating the version number
2. Creating a changelog
3. Publishing to npm
4. Creating a GitHub release

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.
