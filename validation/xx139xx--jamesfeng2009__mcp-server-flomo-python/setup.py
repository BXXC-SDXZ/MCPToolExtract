from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="mcp-server-flomo",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask>=3.0.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=8.0.0",
            "black>=24.0.0",
            "flake8>=7.0.0",
            "mypy>=1.8.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "flomo-server=src.server.__main__:main",
            "flomo-cli=src.cli.__main__:main",
        ],
    },
    author="fengyu",
    author_email="fengyu.zheng@example.com",
    description="MCP服务器和命令行工具，用于与Flomo API交互",
    long_description=long_description,
    long_description_content_type="text/markdown",
    keywords="flomo, api, cli, web server, mcp",
    url="https://github.com/yourusername/mcp-server-flomo-python",
    project_urls={
        "Bug Tracker": "https://github.com/yourusername/mcp-server-flomo-python/issues",
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.7",
) 