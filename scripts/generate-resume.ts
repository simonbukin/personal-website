import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";

const CONTENT_DIR = join(import.meta.dir, "../src/content/resume");
const OUTPUT_FILE = join(import.meta.dir, "resume.typ");

interface BaseEntry {
  section: string;
  order: number;
}

interface ExperienceEntry extends BaseEntry {
  section: "experience";
  id: string;
  company: string;
  companyUrl?: string;
  companyNote?: string;
  title: string;
  location: string;
  dates: string;
  caseStudy?: string;
}

interface VolunteerEntry extends BaseEntry {
  section: "volunteer";
  id: string;
  company: string;
  companyUrl?: string;
  title: string;
  location: string;
  dates: string;
  caseStudy?: string;
}

interface EducationEntry extends BaseEntry {
  section: "education";
  id: string;
  institution: string;
  degree: string;
  dates: string;
}

interface SummaryEntry extends BaseEntry {
  section: "summary";
}

type ResumeEntry = ExperienceEntry | VolunteerEntry | EducationEntry | SummaryEntry;

async function loadResumeEntries(): Promise<{ data: ResumeEntry; content: string }[]> {
  const files = await readdir(CONTENT_DIR);
  const entries: { data: ResumeEntry; content: string }[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const filePath = join(CONTENT_DIR, file);
    const fileContent = await readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    entries.push({ data: data as ResumeEntry, content: content.trim() });
  }

  return entries;
}

function markdownToTypst(md: string): string {
  // Convert **bold** to *bold* (Typst syntax)
  let result = md.replace(/\*\*([^*]+)\*\*/g, "*$1*");

  // Convert [text](url) links to just text (links don't work well in PDF bullets)
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Escape dollar signs
  result = result.replace(/\$/g, "\\$");

  return result;
}

function contentToBullets(content: string): string[] {
  // Split by sentence (roughly) for bullet points
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences.map(s => markdownToTypst(s));
}

function generateTypst(entries: { data: ResumeEntry; content: string }[]): string {
  const summary = entries.find(e => e.data.section === "summary");
  const experience = entries
    .filter(e => e.data.section === "experience")
    .sort((a, b) => a.data.order - b.data.order) as { data: ExperienceEntry; content: string }[];
  const volunteer = entries
    .filter(e => e.data.section === "volunteer")
    .sort((a, b) => a.data.order - b.data.order) as { data: VolunteerEntry; content: string }[];
  const education = entries
    .filter(e => e.data.section === "education")
    .sort((a, b) => a.data.order - b.data.order) as { data: EducationEntry; content: string }[];

  const experienceEntries = experience.map(e => {
    const bullets = contentToBullets(e.content);
    const caseStudyParam = e.data.caseStudy
      ? `\n  caseStudy: "https://simonbukin.com${e.data.caseStudy}",`
      : "";
    const noteParam = e.data.companyNote ? `\n  note: "${e.data.companyNote}",` : "";

    return `#entry(
  "${e.data.company}",
  "${e.data.dates}",
  "${e.data.title}",
  "${e.data.location}",
  (
${bullets.map(b => `    [${b}],`).join("\n")}
  ),${noteParam}${caseStudyParam}
)`;
  }).join("\n\n");

  const volunteerEntries = volunteer.map(e => {
    const bullets = contentToBullets(e.content);
    const caseStudyParam = e.data.caseStudy
      ? `\n  caseStudy: "https://simonbukin.com${e.data.caseStudy}",`
      : "";

    return `#entry(
  "${e.data.company}",
  "${e.data.dates}",
  "${e.data.title}",
  "${e.data.location}",
  (
${bullets.map(b => `    [${b}],`).join("\n")}
  ),${caseStudyParam}
)`;
  }).join("\n\n");

  const educationEntries = education.map(e => {
    return `#education-entry(
  "${e.data.institution}",
  "${e.data.dates}",
  "${e.data.degree}",
)`;
  }).join("\n\n");

  const summaryText = summary ? markdownToTypst(summary.content) : "";

  return `// Resume template for Simon Bukin
// Auto-generated from markdown content - do not edit directly
// Compile with: typst compile resume.typ resume.pdf

#set page(
  paper: "us-letter",
  margin: (top: 0.35in, bottom: 0.35in, left: 0.5in, right: 0.5in),
)

#set text(
  font: "SF Pro Text",
  size: 9.5pt,
  fill: rgb("#374151"),
)

#set par(
  leading: 0.45em,
  justify: false,
)

// Colors
#let subtle = rgb("#6b7280")
#let link-color = rgb("#6366f1")

// Section header
#let section(title) = {
  v(0.35em)
  text(size: 8pt, weight: "bold", fill: subtle, upper(title))
  v(-0.3em)
  line(length: 100%, stroke: 0.4pt + subtle)
  v(0.15em)
}

// Resume entry with bullets
#let entry(company, dates, title, location, bullets, note: none, caseStudy: none) = {
  grid(
    columns: (1fr, auto),
    gutter: 0.5em,
    row-gutter: 0pt,
    [
      #text(weight: "bold")[#company]#if note != none [ #text(fill: subtle)[#note]]
    ],
    align(right, text(size: 8.5pt, fill: subtle)[#dates]),
  )
  v(-0.4em)
  if caseStudy != none {
    [#text(size: 8.5pt, fill: subtle)[#title · #location] #link(caseStudy)[#text(size: 8pt, fill: link-color)[Case study ↗]]]
  } else {
    text(size: 8.5pt, fill: subtle)[#title · #location]
  }
  v(0.05em)
  for (i, bullet) in bullets.enumerate() {
    box[#text(size: 8.5pt, fill: subtle)[•] #text(size: 8.5pt)[#bullet]]
    if i < bullets.len() - 1 { linebreak() }
  }
  v(0.3em)
}

// Education entry
#let education-entry(institution, dates, degree) = {
  grid(
    columns: (1fr, auto),
    gutter: 0.5em,
    text(weight: "bold")[#institution],
    align(right, text(size: 8.5pt, fill: subtle)[#dates]),
  )
  text(size: 8.5pt, fill: subtle)[#degree]
}

// Header
#align(center)[
  #text(size: 18pt, weight: "bold", font: "SF Pro Display")[Simon Bukin]
  #v(-0.35em)
  #text(size: 8.5pt, fill: subtle)[
    San Francisco, CA #h(0.4em) · #h(0.4em)
    #link("mailto:simonbukin@gmail.com")[#text(fill: link-color)[simonbukin\\@gmail.com]] #h(0.4em) · #h(0.4em)
    #link("https://simonbukin.com")[#text(fill: link-color)[simonbukin.com]]
  ]
]

#v(0.2em)

// Summary
#text(size: 9.5pt)[${summaryText}]

// Experience
#section("Experience")

${experienceEntries}

// Open Source & Volunteer
#section("Open Source & Volunteer")

${volunteerEntries}

// Education
#section("Education")

${educationEntries}
`;
}

async function main() {
  console.log("Loading resume entries from markdown...");
  const entries = await loadResumeEntries();
  console.log(`Found ${entries.length} entries`);

  console.log("Generating Typst file...");
  const typst = generateTypst(entries);

  await writeFile(OUTPUT_FILE, typst);
  console.log(`Written to ${OUTPUT_FILE}`);
}

main().catch(console.error);
