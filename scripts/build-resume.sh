#!/bin/bash

# Build resume PDF from markdown content
# Requires: brew install typst

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESUME_PDF="$PROJECT_DIR/public/resume.pdf"
CONTENT_DIR="$PROJECT_DIR/src/content/resume"

# Check if any source files are newer than the PDF
check_needs_rebuild() {
  if [ ! -f "$RESUME_PDF" ]; then
    return 0  # needs rebuild
  fi

  # Check resume content files
  for file in "$CONTENT_DIR"/*.md "$SCRIPT_DIR/generate-resume.ts" "$SCRIPT_DIR/resume.typ"; do
    if [ -f "$file" ] && [ "$file" -nt "$RESUME_PDF" ]; then
      return 0  # needs rebuild
    fi
  done

  return 1  # no rebuild needed
}

# Check if typst is installed
if ! command -v typst &> /dev/null; then
  if check_needs_rebuild; then
    echo "⚠️  Warning: Resume source files have changed but typst is not installed."
    echo "   Run 'brew install typst' locally and rebuild to update public/resume.pdf"
    echo "   Changed files may include: src/content/resume/*.md, scripts/generate-resume.ts"
  else
    echo "Skipping resume build (typst not installed, PDF is up to date)"
  fi
  exit 0
fi

# Generate Typst from markdown
echo "Generating Typst from markdown..."
cd "$PROJECT_DIR"
bun run "$SCRIPT_DIR/generate-resume.ts"

# Compile the resume
echo "Compiling resume..."
typst compile "$SCRIPT_DIR/resume.typ" "$RESUME_PDF"

echo "Resume PDF generated at public/resume.pdf"
