import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/HomePage';
import QuestSelectPage from './pages/QuestSelectPage';
import SkillTunePage from './pages/SkillTunePage';
import SummonResultPage from './pages/SummonResultPage';
import BattlePage from './pages/BattlePage';
import VictoryPage from './pages/VictoryPage';
import LibraryPage from './pages/LibraryPage';
import SharePage from './pages/SharePage';
import MyPage from './pages/MyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quest-select" element={<QuestSelectPage />} />
          <Route path="/skill-tune" element={<SkillTunePage />} />
          <Route path="/summon-result" element={<SummonResultPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/victory" element={<VictoryPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/my" element={<MyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
