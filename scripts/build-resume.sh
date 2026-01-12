#!/bin/bash

# Build resume PDF from markdown content
# Requires: brew install typst

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if typst is installed
if ! command -v typst &> /dev/null; then
    echo "Error: typst is not installed."
    echo "Install it with: brew install typst"
    exit 1
fi

# Generate Typst from markdown
echo "Generating Typst from markdown..."
cd "$PROJECT_DIR"
bun run "$SCRIPT_DIR/generate-resume.ts"

# Compile the resume
echo "Compiling resume..."
typst compile "$SCRIPT_DIR/resume.typ" "$PROJECT_DIR/public/resume.pdf"

echo "Resume PDF generated at public/resume.pdf"
