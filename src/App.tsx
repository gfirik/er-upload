import HouseForm from "@/pages/house-form";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";

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
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<HouseForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
