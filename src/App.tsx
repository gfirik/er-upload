import HouseForm from "@/pages/house-form";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home";
import Profile from "./pages/profile";
import House from "./pages/house";

function App() {
  const { tg, hideMainButton } = useTelegram();
  const location = useLocation();

  useEffect(() => {
    if (!tg) return;

    tg.ready();
    tg.expand();

    if (location.pathname === "/new") {
      tg.MainButton.show();
    } else {
      hideMainButton();
    }
  }, [tg, location, hideMainButton]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<HouseForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/house/:id" element={<House />} />
      </Routes>
    </div>
  );
}

export default App;
