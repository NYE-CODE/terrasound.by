import type { SiteAnnouncement } from "./api";

export interface SiteBootstrap {
  announcement?: SiteAnnouncement;
}

declare global {
  interface Window {
    __SITE_BOOTSTRAP__?: SiteBootstrap;
  }
}

export function readSiteBootstrap(): SiteBootstrap | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__SITE_BOOTSTRAP__;
}

export function isAnnouncementBarVisible(announcement: SiteAnnouncement): boolean {
  return announcement.enabled && announcement.text.trim().length > 0;
}

export function announcementStackHeight(showBar: boolean): string {
  return showBar ? "var(--site-announcement-bar-height)" : "0px";
}

export function applyAnnouncementStackHeight(showBar: boolean): void {
  document.documentElement.style.setProperty(
    "--site-announcement-height",
    announcementStackHeight(showBar),
  );
}
