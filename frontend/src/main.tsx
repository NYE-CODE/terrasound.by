
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/shell.css";
import { applyAnnouncementStackHeight, isAnnouncementBarVisible, readSiteBootstrap } from "./lib/siteBootstrap";

const bootstrapAnnouncement = readSiteBootstrap()?.announcement;
if (bootstrapAnnouncement) {
  applyAnnouncementStackHeight(isAnnouncementBarVisible(bootstrapAnnouncement));
}

function loadDeferredStyles() {
  void import("./styles/deferred.css");
}

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadDeferredStyles);
  } else {
    window.setTimeout(loadDeferredStyles, 1);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
