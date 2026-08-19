const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('.agents/auditor_arch_1/modified_upstream_analysis.json', 'utf8'));

console.log('Total files analyzed:', data.length);

const summary = [];

for (const item of data) {
  const file = item.file;
  const added = item.added;
  const removed = item.removed;
  const intents = item.intents;
  
  // Categorize based on AGENTS.md docking port list and diff nature
  let isOfficialDockingPort = false;
  let category = 'Unknown';
  let risk = 'Low';
  let description = '';

  if (file === 't3-core/packages/contracts/src/index.ts') {
    isOfficialDockingPort = true;
    category = 'Contracts Re-export';
    risk = 'Low';
    description = 'Re-exports ./toolchain.ts and ./hardware/devices.ts';
  } else if (file === 't3-core/packages/contracts/src/rpc.ts') {
    isOfficialDockingPort = true;
    category = 'RPC Endpoint Schema';
    risk = 'Low';
    description = 'Registers toolchain and hardware RPC endpoints in RpcService schema';
  } else if (file === 't3-core/packages/contracts/src/orchestration.ts') {
    category = 'Orchestration Contract';
    risk = 'Low';
    description = 'Adds optional activeToolchain and activeDeviceId to turn-start request payload';
  } else if (file === 't3-core/packages/contracts/src/provider.ts') {
    category = 'Provider Contract';
    risk = 'Low';
    description = 'Adds optional activeToolchain and activeDeviceId to ProviderCommand parameters';
  } else if (file === 't3-core/packages/client-runtime/src/rpc/client.ts') {
    isOfficialDockingPort = true;
    category = 'Client RPC Tag';
    risk = 'Low';
    description = 'Registers hardware subscription tag and environment stream command tags';
  } else if (file === 't3-core/apps/server/src/auth/RpcAuthorization.ts') {
    isOfficialDockingPort = true;
    category = 'Server Auth Mapping';
    risk = 'Low';
    description = 'Maps hardware and toolchain RPC methods to auth scopes';
  } else if (file === 't3-core/apps/server/src/ws.ts') {
    isOfficialDockingPort = true;
    category = 'Server WebSocket RPC Registration';
    risk = 'Medium';
    description = 'Instantiates ToolchainService/DeviceService and binds RPC method handlers';
  } else if (file === 't3-core/apps/server/src/orchestration/decider.ts') {
    category = 'Orchestration Decider';
    risk = 'Low';
    description = 'Preserves activeToolchain and activeDeviceId in thread.turn-start-requested event';
  } else if (file === 't3-core/apps/server/src/orchestration/Layers/ProviderCommandReactor.ts') {
    category = 'Provider Command Reactor';
    risk = 'Low';
    description = 'Forwards activeToolchain and activeDeviceId to provider adapter calls';
  } else if (file === 't3-core/apps/server/src/orchestration/Layers/ProviderRuntimeIngestion.ts') {
    category = 'Runtime Ingestion';
    risk = 'Medium';
    description = 'Injects hardware agent system prompt and device context into prompt construction';
  } else if (file.includes('apps/server/src/provider/Layers/')) {
    category = 'AI Provider Adapters & Tests';
    risk = 'Low';
    description = 'Passes activeToolchain/activeDeviceId through to model providers (Claude, Codex, Cursor, Grok, OpenCode)';
  } else if (file === 't3-core/apps/server/src/pullRequest/GitHubPullRequestCli.ts') {
    category = 'Server GitHub PR Helper';
    risk = 'High';
    description = 'Extensive additions for PR CLI handling (part of upstream sync / PR toolchain)';
  } else if (file === 't3-core/apps/web/src/components/sidebar/SidebarChrome.tsx') {
    isOfficialDockingPort = true;
    category = 'UI Navigation Dock';
    risk = 'Low';
    description = 'Renders <ToolchainSetupPill /> in sidebar';
  } else if (file === 't3-core/apps/web/src/components/BranchToolbar.tsx') {
    isOfficialDockingPort = true;
    category = 'UI Navigation Dock';
    risk = 'Low';
    description = 'Renders <BoardSelectorPill /> in branch toolbar';
  } else if (file === 't3-core/apps/web/src/components/settings/SettingsPanels.tsx') {
    isOfficialDockingPort = true;
    category = 'UI Settings Dock';
    risk = 'Low';
    description = 'Renders Active Build Toolchain settings row and board settings';
  } else if (file === 't3-core/apps/web/src/components/ChatView.tsx') {
    category = 'Web Chat View';
    risk = 'High';
    description = 'Passes activeToolchain and activeDeviceId into thread dispatch and action triggers (+198 lines)';
  } else if (file === 't3-core/apps/web/src/components/chat/ChatHeader.tsx') {
    category = 'Web Chat Header';
    risk = 'Low';
    description = 'UI hooks for active board status / header actions';
  } else if (file === 't3-core/apps/web/src/components/chat/MessagesTimeline.tsx') {
    category = 'Web Message Timeline';
    risk = 'Medium';
    description = 'Renders hardware action cards / verification chips in message stream (+90 lines)';
  } else if (file === 't3-core/apps/web/src/index.css') {
    category = 'CSS Styles';
    risk = 'Low';
    description = 'Hardware and toolchain UI styles, keyframes, popover styling';
  } else if (file === 't3-core/package.json' || file === 't3-core/pnpm-workspace.yaml') {
    category = 'Root Package/Workspace';
    risk = 'Low';
    description = 'Pruned mobile workspace package references and recorded upstream comment';
  } else {
    category = 'Other Upstream Touch';
    risk = 'Low';
    description = 'Minor formatting / type alignment from upstream sync';
  }

  summary.push({
    file,
    intents: intents.join(','),
    added,
    removed,
    totalDiff: added + removed,
    isOfficialDockingPort,
    category,
    risk,
    description
  });
}

fs.writeFileSync('.agents/auditor_arch_1/categorized_ports.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('Saved categorized_ports.json in UTF-8');
