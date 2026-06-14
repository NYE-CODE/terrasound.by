import { useEffect } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import {
  useSiteAnnouncement,
  useSiteAnnouncementBarVisible,
} from "../../../context/SiteAnnouncementContext";

export function SiteHeader() {
  const announcement = useSiteAnnouncement();
  const showBar = useSiteAnnouncementBarVisible();

  useEffect(() => {
    const height = showBar ? "var(--site-announcement-bar-height)" : "0px";
    document.documentElement.style.setProperty("--site-announcement-height", height);
    return () => {
      document.documentElement.style.setProperty("--site-announcement-height", "0px");
    };
  }, [showBar]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[70] bg-background">
      {showBar ? <AnnouncementBar text={announcement.text.trim()} /> : null}
      <Navbar />
    </header>
  );
}
