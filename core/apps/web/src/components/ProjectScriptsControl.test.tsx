import type { ProjectScript, ResolvedKeybindingsConfig } from "@embedino/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import ProjectScriptsControl from "./ProjectScriptsControl";

const EMPTY_KEYBINDINGS: ResolvedKeybindingsConfig = [];
const PRIMARY_SCRIPT: ProjectScript = {
  id: "dev",
  name: "Dev",
  command: "vp dev",
  icon: "play",
  runOnWorktreeCreate: false,
};

function renderControl(scripts: ReadonlyArray<ProjectScript>) {
  return renderToStaticMarkup(
    <ProjectScriptsControl
      scripts={scripts}
      keybindings={EMPTY_KEYBINDINGS}
      onRunScript={() => {}}
      onAddScript={async () => undefined as never}
      onUpdateScript={async () => undefined as never}
      onDeleteScript={async () => undefined as never}
    />,
  );
}

describe("ProjectScriptsControl compact controls", () => {
  it("collapses all actions behind a single compact add trigger", () => {
    const html = renderControl([PRIMARY_SCRIPT]);

    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(1);
    expect(html).toContain('aria-label="Project actions"');
    // The trigger keeps the compact header sizing; its label stays screen-only.
    expect(html).toContain("w-7 px-0");
    expect(html).toContain("sm:w-6");
    expect(html).toContain('class="sr-only">Add action</span>');
    expect(html).toContain('data-toolbar-control=""');
  });

  it("never renders script names or run buttons outside the popup", () => {
    const html = renderControl([PRIMARY_SCRIPT]);

    expect(html).not.toContain(">Dev</span>");
    expect(html).not.toContain('aria-label="Run Dev"');
    // Menus render in portals, so only the trigger exists in static markup.
    expect((html.match(/<button/g) ?? []).length).toBe(1);
  });
});
