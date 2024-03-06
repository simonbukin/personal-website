---
title: Protecting Google Cloud Customers
date: 2023-01-16
description: A UX case study on how to protect Google Cloud customers from malicious actors.
slug: gcs-security
tags:
  - ux
  - google
company: Google
role: UX Designer
timeline: 3 months
launch: '2023'
---

## NDA

Wherever possible, I have anonymized or generalized information to avoid breaching NDA, so some details may be missing.

## The Product

Google Cloud Storage (GCS) is a product offered as part of the Google Cloud suite focused on providing cheap, high-quality object storage for all users.

## The Problem

Google's Support line was receiving reports of GCS users reaching out to restore data that had been deleted from their account, either accidentally or by unauthorized access. Though Support is able to restore their data, this resulted in lost time and frustration since there was no documentation surrounding this feature and users had to reach out to Support.‍This was a space that could reasonably be filled by a solution directly in the GCS UI, as Support could already restore objects for users, meaning the functionality existed on the backend. Our research team surfaced 2 specific cases where users may have lost their data:

### Accidental Deletion

Users accidentally deleted data in their storage buckets and want to get it back.

### Malicious Actor

The user's Google Cloud account is accessed by a malicious 3rd party, who then deletes data in their storage buckets.

## Research

As part of user research in collaboration with the Storage research team, I worked on Competitive Analysis and User Journey Mapping. The Storage research team had some insights that had been surfaced during interviews and user observation sessions that we used to inform our designs as well.

### Competitive Analysis

GCS was compared against the other major competitors in the cloud storage market, including Microsoft Azure and Amazon Web Services. I collaborated with another UX designer on my team to collect data about all these services and collate them into a sheet. We used this data to identify possible patterns to follow in creating GCS's restore functionality.

### User Journey Mapping

I created user journey maps to evaluate what the current experience was for restoring objects, as well as improvements that could be made to this process.

![Existing flow](/existing-flow2.png)

![Proposed new flow](/new-flow.png)

## Scoping

I met with engineer, product, and user research teams to properly understand the scope of this feature, and what we wanted to accomplish in the time we had before engineering handoff.

We initially decided on updating the bucket details page, as well as the overview page, though this changed later in the project to include a larger scope.

## Ideation

For quick testing of ideas, I spent time on low fidelity mockups on paper. When I had generated a few that I felt were promising, I converted them into Figma mockups and presented them to my team to get feedback on the design and experience.‍

Ideally, user testing at this stage would have identified potential usability issues and shown us if we were heading down the wrong path, but time constraints on the research team did not allow for this during this project.‍

Since GCS was using the Google Material Design system, the specific look and feel was handled, with the majority of the project focusing on the prototyping and engineering handoff phases.

### Low Fidelity Mockups

![Low fidelity mock 1](/low-fidelity.jpg)

![Low fidelity mock 2](/low-fidelity2.jpg)

## Restoration Functionality

Throughout the design process, our team narrowed down the object restoration functionality to be the main touchpoint in the user's journey, but the user could access this touchpoint in a variety of ways. An analogy for this would be something like deleting a file on your computer. The deletion is the same wherever you access it, but can be activated from a variety of places, like your Desktop, in the File Manager, or even on the Command Line. In short, the key difficulty in this project was developing a clean interface for where the user would be using the object restoration feature.

## Polishing & Delivery

I made sure to meet weekly with the engineering team to ensure that there were no surprises or issues later down the road with feasibility.

After narrowing the ideas I had developed in the previous stage through design critiques and meetings with engineering and product, I settled on creating high fidelity Figma prototypes for all the major object restoration flows.

After further critique within my design team, I presented these flows to engineering to prepare for handoff, and received positive feedback from stakeholders on both the simplicity of the flows developed and the overall visual design.

Note: these high fidelity mocks are recreations made after leaving the company, and are made some time after the project. They are not 100% representative of the original work, and not all flows are included to avoid NDA conflicts. The original mocks are internal to Google and cannot be presented.

### High Fidelity Mockups

![High fidelity mock 1](/gcs-screen1.png)

![High fidelity mock 2](/gcs-screen2.png)

![High fidelity mock 3](/gcs-screen3.png)

![High fidelity mock 4](/gcs-screen4.png)

## Learnings & Takeaways

As with any project, most of the learning was done by taking stock of the mistakes made along the way.

### Involving user research in during the sprint process

Given the size and privacy considerations of a company at the scale of Google, it was difficult to get clearance to get user feedback on prototypes since the approval process was lengthy. With the project being relatively short term, this led to making assumptions about user needs and empathizing in place of getting concrete user feedback in some places. Though I made sure to speak to as many internal users as I could, I was aware that this was not fully representative of our entire potential user base. In the future, baking in user research and usability testing into the timeline would have helped, if changing the timeline was at all possible.

### Scope creep

The design team already had an existing project that had some overlap with the restore flow. This led to situations where certain features or flows made sense in the context of both projects (such as updating user onboarding, or adding a new page to track long-running jobs). In the future, this could be remedied by setting clear scope expectations with engineering, product and design early in the process, which would minimize scope changes after the fact.

### Settling on solutions

As a newer designer, I provided a variety of options during prototyping, but engineering was expecting design decisions and flows to be decided by me. This led to some initial confusion, but I worked on getting design critiques done before presenting my work to engineering and having strong, solid reasoning for my design decisions to solve this issue.
