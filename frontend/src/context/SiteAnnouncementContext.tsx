import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type SiteAnnouncement } from "../lib/api";
import { reportLoadError } from "../lib/loadError";

const DEFAULT_SITE_ANNOUNCEMENT: SiteAnnouncement = {
  text: "",
  enabled: false,
};

const SiteAnnouncementContext = createContext<SiteAnnouncement>(DEFAULT_SITE_ANNOUNCEMENT);

export function SiteAnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement>(DEFAULT_SITE_ANNOUNCEMENT);

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
