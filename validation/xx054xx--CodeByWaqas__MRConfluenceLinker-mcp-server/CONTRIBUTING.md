# Contributing to GitLab PR Analysis MCP Server

Thank you for your interest in contributing to the GitLab PR Analysis MCP Server! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if the issue has already been reported
2. Use the issue templates provided
3. Include as much relevant information as possible:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (Python version, OS, etc.)
   - Logs and error messages

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```
3. Make your changes
4. Add tests for new functionality
5. Update documentation as needed
6. Commit your changes:
   ```bash
   git commit -m "Description of your changes"
   ```
7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a Pull Request

### Development Setup

1. Clone your fork:
   ```bash
   git clone git@github.com:CodeByWaqas/MRConfluenceLinker-mcp-server.git
   cd MRConfluenceLinker-mcp-server
   ```

2. Set up the development environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your credentials.

### Code Style

- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to all functions and classes
- Keep functions focused and single-purpose
- Add type hints where appropriate

Example:
```python
def analyze_code_changes(project_id: str, mr_id: int) -> Dict[str, Any]:
    """
    Analyze code changes in a merge request.

    Args:
        project_id (str): The GitLab project ID
        mr_id (int): The merge request ID to analyze

    Returns:
        Dict[str, Any]: Analysis results including statistics and file changes

    Raises:
        ValueError: If project_id or mr_id is invalid
    """
    # Implementation
```

### Testing

1. Write unit tests for new functionality
2. Ensure all tests pass before submitting PR
3. Add integration tests for API interactions
4. Use pytest for testing:
   ```bash
   pytest tests/
   ```

### Documentation

1. Update README.md if needed
2. Add docstrings to new functions/classes
3. Update API documentation
4. Add comments for complex logic

### Commit Messages

Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

Example:
```
feat(analyzer): add file type analysis to MR reports

- Add detection of file types in changed files
- Group changes by file type
- Add statistics for each file type
```

### Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PRs focused and manageable
4. Update PR description as needed

### Release Process

1. Version numbers follow semantic versioning
2. Update CHANGELOG.md
3. Create a release tag
4. Update documentation

## Project Structure

```
MRConfluenceLinker-mcp-server/
├── src/                           # Source code directory
│   └── MRConfluenceLinker-mcp-server/  # Main server package
│       ├── resources/            # Resource modules
│       │   ├── __init__.py
│       │   ├── client.py        # Client implementation / Gitlab PR integration
│       ├── server.py            # Main server implementation
│       └── mcp_server.log       # Server logs
├── __pycache__/                 # Python cache files
├── .git/                        # Git repository
├── .gitignore                   # Git ignore rules
├── CONTRIBUTING.md              # Contributing guidelines
├── LICENSE                      # Project license
├── README.md                    # Project documentation
├── pyproject.toml              # Python project configuration
├── requirements.txt            # Project dependencies
└── uv.lock                     # Dependency lock file
```

Key files and their purposes:
- `src/MRConfluenceLinker-mcp-server/server.py`: Main MCP server implementation
- `src/MRConfluenceLinker-mcp-server/resources/client.py`: Client-side implementation / GitLab PR integration
- `requirements.txt`: List of Python package dependencies
- `pyproject.toml`: Python project metadata and build configuration
- `uv.lock`: Locked versions of dependencies for reproducible builds
- `.env.example`: Template for environment variables configuration
- `mcp_server.log`: Server logs for debugging and monitoring

## Getting Help

- Check the README.md
- Review existing issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
