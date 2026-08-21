import { UserButton, useAuth } from "@clerk/react";
import { LogInIcon, ServerIcon, SmartphoneIcon } from "lucide-react";

import { hasCloudPublicConfig } from "../../cloud/publicConfig";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { MobileClientsUserProfilePage } from "./MobileClientsUserProfilePage";
import { EmbedinoConnectUserProfilePage } from "./EmbedinoConnectUserProfilePage";
import { useEmbedinoConnectAuthPrompt } from "./useEmbedinoConnectAuthPrompt";

export function EmbedinoConnectSidebarSignIn() {
  if (!hasCloudPublicConfig()) return null;

  return <ConfiguredEmbedinoConnectSidebarSignIn />;
}

export function EmbedinoConnectSidebarAvatar() {
  if (!hasCloudPublicConfig()) return null;

  return <ConfiguredEmbedinoConnectSidebarAvatar />;
}

function ConfiguredEmbedinoConnectSidebarAvatar() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) return null;

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "size-7",
          userButtonTrigger: "rounded-lg p-1 hover:bg-sidebar-row-hover",
        },
      }}
    >
      <UserButton.UserProfilePage
        label="Mobile clients"
        labelIcon={<SmartphoneIcon className="size-4" />}
        url="mobile-clients"
      >
        <MobileClientsUserProfilePage />
      </UserButton.UserProfilePage>
      <UserButton.UserProfilePage
        label="Embedino Connect"
        labelIcon={<ServerIcon className="size-4" />}
        url="embedino-connect"
      >
        <EmbedinoConnectUserProfilePage />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}

function ConfiguredEmbedinoConnectSidebarSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const { authPrompt, openAuthPrompt } = useEmbedinoConnectAuthPrompt();

  if (!isLoaded || isSignedIn) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={openAuthPrompt}>
            <LogInIcon />
            <span>Sign in to Embedino Connect</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {authPrompt}
    </>
  );
}
