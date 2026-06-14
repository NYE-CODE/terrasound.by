import { useLayoutEffect } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import {
  useSiteAnnouncement,
  useSiteAnnouncementBarVisible,
} from "../../../context/SiteAnnouncementContext";
import { applyAnnouncementStackHeight } from "../../../lib/siteBootstrap";

export function SiteHeader() {
  const announcement = useSiteAnnouncement();
  const showBar = useSiteAnnouncementBarVisible();

  useLayoutEffect(() => {
    applyAnnouncementStackHeight(showBar);
    return () => {
      applyAnnouncementStackHeight(false);
    };
  }, [showBar]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[70] bg-background">
      {showBar ? (
        <AnnouncementBar
          text={announcement.text.trim()}
          scrollDurationSeconds={announcement.scrollDurationSeconds}
        />
      ) : null}
      <Navbar />
    </header>
  );
}
