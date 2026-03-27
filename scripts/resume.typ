// Resume template for Simon Bukin
// Auto-generated from markdown content - do not edit directly
// Compile with: typst compile resume.typ resume.pdf

#set page(
  paper: "us-letter",
  margin: (top: 0.25in, bottom: 0.25in, left: 0.5in, right: 0.5in),
)

#set text(
  font: "SF Pro Text",
  size: 9.5pt,
  fill: rgb("#374151"),
)

#set par(
  leading: 0.35em,
  justify: false,
)

// Colors
#let subtle = rgb("#6b7280")
#let link-color = rgb("#6366f1")

// Section header
#let section(title) = {
  v(0.15em)
  text(size: 8pt, weight: "bold", fill: subtle, upper(title))
  v(-0.3em)
  line(length: 100%, stroke: 0.4pt + subtle)
  v(0.05em)
}

// Resume entry with bullets
#let entry(company, dates, title, location, bullets, note: none, caseStudy: none) = {
  grid(
    columns: (1fr, auto),
    gutter: 0.4em,
    row-gutter: 0pt,
    [
      #text(weight: "bold")[#company]#if note != none [ #text(fill: subtle)[#note]]
    ],
    align(right, text(size: 8.5pt, fill: subtle)[#dates]),
  )
  v(-0.45em)
  if caseStudy != none {
    [#text(size: 8.5pt, fill: subtle)[#title · #location] #link(caseStudy)[#text(size: 8pt, fill: link-color)[Case study ↗]]]
  } else {
    text(size: 8.5pt, fill: subtle)[#title · #location]
  }
  v(0.0em)
  for (i, bullet) in bullets.enumerate() {
    box[#text(size: 8.5pt, fill: subtle)[•] #text(size: 8.5pt)[#bullet]]
    if i < bullets.len() - 1 { linebreak() }
  }
  v(0.1em)
}

// Education entry
#let education-entry(institution, dates, degree) = {
  grid(
    columns: (1fr, auto),
    gutter: 0.4em,
    text(weight: "bold")[#institution],
    align(right, text(size: 8.5pt, fill: subtle)[#dates]),
  )
  text(size: 8.5pt, fill: subtle)[#degree]
}

// Header
#align(center)[
  #text(size: 16pt, weight: "bold", font: "SF Pro Display")[Simon Bukin]
  #v(-0.4em)
  #text(size: 8.5pt, fill: subtle)[
    San Francisco, CA #h(0.4em) · #h(0.4em)
    #link("mailto:simonbukin@gmail.com")[#text(fill: link-color)[simonbukin\@gmail.com]] #h(0.4em) · #h(0.4em)
    #link("https://simonbukin.com")[#text(fill: link-color)[simonbukin.com]] #h(0.4em) · #h(0.4em)
    #link("https://linkedin.com/in/simonbukin")[#text(fill: link-color)[linkedin]]
  ]
]

#v(0.1em)

// Summary
#text(size: 9.5pt)[Design Engineer with expertise in designing and building scalable frontend solutions. Skilled in leading projects from ideation to deployment, collaborating cross-functionally to deliver high-impact features.]

// Experience
#section("Experience")

#entry(
  "Morf Health",
  "2024 - Present",
  "Founding Product Engineer",
  "San Francisco, CA",
  (
    [Built *AI-powered healthcare automation* tools helping small practices streamline patient-facing workflows.],
    [Owned product end-to-end from *Figma* prototypes to production deployments and monitoring via *PostHog*.],
    [Overhauled AI chat agent UX and prompting to increase adoption by *250%* in 3 weeks.],
    [Migrated legacy Next.js app to *Vite + React*, cutting page load by *75%* and doubling feature velocity.],
  ),
  caseStudy: "https://simonbukin.com/portfolio/morf-flo",
)

#entry(
  "Variance",
  "2024",
  "Senior Design Engineer",
  "San Francisco, CA",
  (
    [Led frontend development for enterprise *AI safety* tooling.],
    [Built component library with *ShadCN* and *Figma*, developed typesafe fullstack patterns with *Redux*, *Prisma*, and *TypeScript*.],
    [Shipped features on tight timelines that closed *\$250K+* contracts.],
  ),
  note: "(formerly Intrinsic)",
)

#entry(
  "Archipelago AI",
  "2023 - 2024",
  "Founding Frontend Engineer",
  "Remote",
  (
    [Built the frontend from scratch in *Svelte* — onboarding flows, chat interfaces, and marketing site (*Astro* + *React*).],
    [Established the design system in *Figma* with *Tailwind* implementation.],
    [Created custom refraction shader with *D3.js* for marketing materials.],
  ),
)

#entry(
  "Google, YouTube",
  "2022 - 2023",
  "Software Engineer",
  "San Bruno, CA",
  (
    [Built Web Components for YouTube Premium using *C++* and *Polymer*.],
    [Ran A/B tests that improved click-through rates by *8%* across *500K users*.],
    [Implemented compliance features for the Premium cancellation flow serving *100K+ users*.],
  ),
)

#entry(
  "Amazon Web Services, SageMaker Console",
  "2020 - 2021",
  "Frontend Software Development Engineer",
  "Seattle, WA",
  (
    [Developed sign-up flows for RStudio integration using *React*, *Styled Components*, and *RxJS*.],
    [Maintained *85%+* test coverage with *Cypress* and *Jest*.],
    [Documented oncall processes, reducing ticket backlog by *20%*.],
  ),
  caseStudy: "https://simonbukin.com/portfolio/sagemaker-onboarding",
)

// Open Source & Volunteer
#section("Open Source & Volunteer")

#entry(
  "Corbett-Detig Lab, UCSC",
  "2023",
  "Research Programmer",
  "Santa Cruz, CA",
  (
    [Added geography features to Taxonium.org, a genomic visualization tool for tracking COVID-19's genetic origins.],
    [Built with *React* and *Deck.gl*, optimized for *1M+ sample* datasets.],
  ),
)

#entry(
  "Google Cloud Storage",
  "2022 - 2023",
  "UX Designer",
  "Sunnyvale, CA",
  (
    [Designed prototypes in *Figma* for Google Cloud Storage's Soft Deletion feature.],
    [Led design reviews with UX Research, Engineering, and Product.],
    [Ensured *WCAG accessibility* compliance.],
  ),
  caseStudy: "https://simonbukin.com/portfolio/gcs-security",
)

// Education
#section("Education")

#education-entry(
  "University of California, Santa Cruz",
  "2016 - 2020",
  "BS Computer Science, Minor in Statistics",
)
