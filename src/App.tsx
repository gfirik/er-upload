import HouseForm from "@/pages/house-form";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home";
import Profile from "./pages/profile";

function App() {
  const { tg } = useTelegram();

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<HouseForm />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
