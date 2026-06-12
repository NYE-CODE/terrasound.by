import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type SiteContact } from "../lib/api";
import { reportLoadError } from "../lib/loadError";
import { DEFAULT_SITE_CONTACT } from "../lib/site";

const SiteContactContext = createContext<SiteContact>(DEFAULT_SITE_CONTACT);

export function SiteContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<SiteContact>(DEFAULT_SITE_CONTACT);

  useEffect(() => {
    api.getSiteContact().then(setContact).catch(reportLoadError);
  }, []);

  return <SiteContactContext.Provider value={contact}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact(): SiteContact {
  return useContext(SiteContactContext);
}
