import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ReCicloProvider } from './context/ReCicloContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { Chat } from './components/Chat';
import { Home } from './pages/Home';
import { Ganadero } from './pages/Ganadero';
import { Comerciante } from './pages/Comerciante';
import { Perfiles } from './pages/Perfiles';

export default function App() {
  return (
    <BrowserRouter>
      <ReCicloProvider>
        <div className="min-h-screen flex flex-col bg-white text-[#141714]">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ganadero" element={<Ganadero />} />
              <Route path="/comerciante" element={<Comerciante />} />
              <Route path="/perfiles" element={<Perfiles />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="hidden md:block border-t border-[#E4E7E3] bg-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6C736C]">
              <span>ReCiclo — «Lo que sobra, a alguien le sirve»</span>
              <span>
                Plataforma demostrativa de economía circular · Datos locales en
                JSON
              </span>
            </div>
          </footer>
          <BottomTabBar />
          <Chat />
        </div>
      </ReCicloProvider>
    </BrowserRouter>
  );
}
