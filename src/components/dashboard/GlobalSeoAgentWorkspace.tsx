import React from "react";
import { AiGlobalSeoAgent } from "./AiGlobalSeoAgent";
import { SiteConfig } from "../../types";

interface GlobalSeoAgentWorkspaceProps {
  config: SiteConfig;
  onChange: (newConfig: SiteConfig) => void;
  onPreview?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const GlobalSeoAgentWorkspace: React.FC<GlobalSeoAgentWorkspaceProps> = (props) => {
  return <AiGlobalSeoAgent {...props} />;
};

export { AiGlobalSeoAgent };
