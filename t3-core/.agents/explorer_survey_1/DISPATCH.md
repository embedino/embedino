## 2026-08-12T22:09:24Z

You are Frontend Codebase Auditor Explorer (Explorer 1).
Working directory: c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\explorer_survey_1
Original Request File: c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\ORIGINAL_REQUEST.md

Please read c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\ORIGINAL_REQUEST.md carefully.

Objective:
Investigate and map the entire frontend application located in `apps/web/src` (or `src` if applicable) for Requirement R1: Comprehensive Frontend Audit.

1. Map all files, directories, components, pages/routes, custom hooks, utils, and state management setups in `apps/web/src`.
2. Inspect for "AI smells", temporary hacks, repetitive code, unhandled edge cases, dead code, poorly typed constructs (`any`, implicit types), bad React patterns (e.g. missing/incorrect useEffect dependencies, unhandled error states, missing loading UI, unsafe assertions).
3. Identify candidate refactoring targets and group them logically into modules/features.
4. Produce a detailed findings report with exact file paths and line numbers.

Write your final findings report to `c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\explorer_survey_1\handoff.md`.
Maintain `progress.md` in your working directory.
When complete, notify parent via send_message.
