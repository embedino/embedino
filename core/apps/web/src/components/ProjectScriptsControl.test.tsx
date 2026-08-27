import type { ProjectScript } from "@embedino/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import ProjectScriptsControl from "./ProjectScriptsControl";

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
      onAddScript={async () => undefined as never}
      onUpdateScript={async () => undefined as never}
      onDeleteScript={async () => undefined as never}
    />,
  );
}

describe("ProjectScriptsControl compact controls", () => {
  it("renders a single add trigger that opens the editor instead of a menu", () => {
    const html = renderControl([PRIMARY_SCRIPT]);

    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(1);
    expect(html).toContain('aria-label="Add action"');
    // A direct action, not another popup: no menu semantics on the trigger.
    expect(html).not.toContain("aria-haspopup");
    expect(html).toContain('class="sr-only">Add action</span>');
    expect(html).toContain('data-toolbar-control=""');
  });

  it("never renders script names or run buttons outside the dialog", () => {
    const html = renderControl([PRIMARY_SCRIPT]);

    expect(html).not.toContain(">Dev</span>");
    expect(html).not.toContain('aria-label="Run Dev"');
    expect((html.match(/<button/g) ?? []).length).toBe(1);
  });
});
