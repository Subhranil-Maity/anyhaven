import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { SearchPage } from "@/pages/SearchPage";
import { DownloadsPage } from "@/pages/DownloadsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { FineSearchPage } from "@/pages/FineSearchPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/finesearch" element={<FineSearchPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
