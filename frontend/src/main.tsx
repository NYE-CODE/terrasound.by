
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { capturePrerenderSnapshot } from "./lib/prerenderSnapshot";
import { applyAnnouncementStackHeight, isAnnouncementBarVisible, readSiteBootstrap } from "./lib/siteBootstrap";

const bootstrapAnnouncement = readSiteBootstrap()?.announcement;
if (bootstrapAnnouncement) {
  applyAnnouncementStackHeight(isAnnouncementBarVisible(bootstrapAnnouncement));
}

const rootEl = document.getElementById("root")!;
capturePrerenderSnapshot(rootEl);
createRoot(rootEl).render(<App />);
