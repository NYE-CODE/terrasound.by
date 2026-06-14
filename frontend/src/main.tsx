
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/fonts.css";
  import "./styles/index.css";
  import { applyAnnouncementStackHeight, isAnnouncementBarVisible, readSiteBootstrap } from "./lib/siteBootstrap";

  const bootstrapAnnouncement = readSiteBootstrap()?.announcement;
  if (bootstrapAnnouncement) {
    applyAnnouncementStackHeight(isAnnouncementBarVisible(bootstrapAnnouncement));
  }

  createRoot(document.getElementById("root")!).render(<App />);
  