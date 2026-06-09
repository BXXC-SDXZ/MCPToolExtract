"""
Nox sessions for the MySQL MCP Server project.
"""

import nox


@nox.session
def test(session):
    """Run the test suite."""
    session.install("-r", "dev-requirements.txt")
    session.install("-r", "requirements.txt")
    session.run("pytest", "tests/")


@nox.session
def format(session):
    """Format code with Ruff."""
    session.install("ruff")
    session.run("ruff", "format", "--config=./.ruff.toml", ".")


@nox.session
def lint(session):
    """Lint code with Ruff."""
    session.install("ruff")
    session.run("ruff", "check", "--fix", "--config=./.ruff.toml", ".")
