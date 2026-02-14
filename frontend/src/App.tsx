import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DataManagement } from "@/pages/DataManagement";
import { SearchPage } from "@/pages/Search";
import { ChatPage } from "@/pages/Chat";
import { AdminPage } from "@/pages/Admin";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/data" replace />} />
        <Route path="/data" element={<DataManagement />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
