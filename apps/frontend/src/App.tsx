import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RawSearchPage } from "@/pages/RawSearchPage";
import { DownloadsPage } from "@/pages/DownloadsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { FineSearchPage } from "@/pages/FineSearchPage";
import { SearchPage } from "@/pages/SearchPage";
import { AnimeDetailsPage } from "./pages/AnimeDetailsPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/details/:id" element={<AnimeDetailsPage />} />
        <Route path="/rawsearch" element={<RawSearchPage />} />
        <Route path="/finesearch" element={<FineSearchPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
