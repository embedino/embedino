# Embedino Project Timeline

### Q3 2026
- **August 19, 2026**: 
  - Token-optimized the Embedino Hardware System Prompt to fit within a ~300 token XML structure.
  - Implemented the "Mid-Chat Hardware Swap" detection system across Cursor, Grok, OpenCode, and Codex adapters. The AI now dynamically updates its internal state when a user hot-swaps a USB device during an active chat.
  - Successfully audited and strictly typed all custom provider adapter extensions.
- **August 18, 2026**: 
  - Added explicit module variant confirmation logic to prevent flashing incorrect firmware to generic-named boards (e.g., generic ESP32 vs ESP32-S3-WROOM).
  - Redesigned Board Selector UI.
- **August 15, 2026**: 
  - Restructured `t3-core` into the Embedino architecture following the 95/5 Modular Isolation Principle.
  - Established `regraft.json` synchronization pipeline.
- **Early August 2026**: 
  - Initial scaffolding of the Embedino concept, focusing on PlatformIO and Arduino CLI integrations.

### Upcoming Milestones
- **Q4 2026**: Release Interactive Wiring Viewer.
- **Q4 2026 (November)**: V1 MVP Beta Launch!
- **Q1 2027**: Expanded support for bare-metal Zephyr and ESP-IDF compilation directly within the local workspace environment.
- **Q2 2027**: AI-Powered Datasheet Explorer (pdf.js integration).
