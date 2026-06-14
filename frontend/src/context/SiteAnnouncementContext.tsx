import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type SiteAnnouncement } from "../lib/api";
import { reportLoadError } from "../lib/loadError";
import { readSiteBootstrap } from "../lib/siteBootstrap";

const DEFAULT_SITE_ANNOUNCEMENT: SiteAnnouncement = {
  text: "",
  enabled: false,
  scrollDurationSeconds: 45,
};

const SiteAnnouncementContext = createContext<SiteAnnouncement>(DEFAULT_SITE_ANNOUNCEMENT);

function initialAnnouncement(): SiteAnnouncement {
  return readSiteBootstrap()?.announcement ?? DEFAULT_SITE_ANNOUNCEMENT;
}

export function SiteAnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement>(initialAnnouncement);

  useEffect(() => {
    api.getSiteAnnouncement().then(setAnnouncement).catch(reportLoadError);
  }, []);

  return (
    <SiteAnnouncementContext.Provider value={announcement}>{children}</SiteAnnouncementContext.Provider>
  );
}

export function useSiteAnnouncement(): SiteAnnouncement {
  return useContext(SiteAnnouncementContext);
}

export function useSiteAnnouncementBarVisible(): boolean {
  const announcement = useSiteAnnouncement();
  return announcement.enabled && announcement.text.trim().length > 0;
}
