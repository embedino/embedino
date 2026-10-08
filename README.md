<div align="center">
  <img src="logo.svg" alt="Embedino logo" width="92" height="92">
  <h1>Embedino</h1>
  <p><strong>Hardware context for AI-assisted firmware development.</strong></p>
  <p><a href="https://www.embedino.app/">Website</a> · <a href="#what-were-building">What we're building</a> · <a href="#project-status">Project status</a> · <a href="https://github.com/embedino/embedino/issues">Give feedback</a></p>
</div>

## The problem

AI can draft firmware, but it needs more than a feature request to write code for a real device. The board variant, connected components, pin assignments, electrical limits, libraries, and build errors all affect whether that code is useful. Today those facts are often scattered across datasheets, wiring notes, configuration files, and developer knowledge.

**Embedino is building a harness that carries hardware context through the firmware workflow.** The aim is to help an AI assistant write and revise firmware against an explicit description of the hardware and feedback from builds and device tests.

## What we're building

The intended workflow has three parts:

1. **Describe the target.** Capture the board, peripherals, interfaces, pins, and constraints in reusable project context.
2. **Draft firmware with that context.** Supply the relevant hardware facts and requirements to an AI assistant when it creates or edits code.
3. **Check and iterate.** Feed compiler output and observed device behavior back into the next revision.

This is the product direction, not a claim that the full loop is available today. Generated firmware still needs engineering review and testing on the actual hardware.

## Project status

Embedino is in early development. This repository currently contains the project overview and branding; it does **not** yet contain an installable harness or a public firmware release. We will document the architecture, examples, and setup steps here as they become available.

Our near-term focus is to define a useful hardware context format, connect it to an AI-assisted firmware workflow, and make build and test feedback actionable. See [embedino.app](https://www.embedino.app/) for the current product description.

## Give feedback

If you build embedded systems, we would especially value examples where generated firmware fails because it lacked board or component context. [Open an issue](https://github.com/embedino/embedino/issues/new) with the target board, the missing hardware fact, and the failure you observed. Please avoid posting secrets or private design files.

## License

The files in this repository are distributed under the [MIT License](LICENSE). Future code releases will state their license alongside the code.
