import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Home,
  Square,
  Layers,
  Trash2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface House {
  id: number;
  shahar: string;
  tuman: string;
  manzil: string;
  oylik: number;
  garov_puli: number;
  xonalar_soni: number;
  qavat: number;
  tavsif?: string;
  contact: { phone: string };
  xonadosh_bolish: boolean;
  images: string[];
  created_at: string;
}

export default function Profile() {
  const { tg } = useTelegram();
  const [userHouses, setUserHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tg?.initDataUnsafe?.user?.id) {
      fetchUserHouses();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tg]);

  const fetchUserHouses = async () => {
    if (!tg?.initDataUnsafe.user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .eq("telegram_id", tg.initDataUnsafe.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserHouses(data || []);
    } catch (error) {
      console.error("Error fetching user houses:", error);
      tg?.showAlert?.("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const deleteHouse = async (houseId: number) => {
    setDeletingId(houseId);
    try {
      const { error } = await supabase
        .from("houses")
        .delete()
        .eq("id", houseId)
        .eq("telegram_id", tg?.initDataUnsafe.user?.id);

      if (error) throw error;

      setUserHouses((prev) => prev.filter((house) => house.id !== houseId));
      tg?.showAlert?.("E'lon o'chirildi");
    } catch (error) {
      console.error("Error deleting house:", error);
      tg?.showAlert?.("O'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="text-center">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-foreground py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="relative mb-8 flex flex-col items-center text-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="absolute left-2 top-1 flex items-center gap-1 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>

          <div className="mt-2 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Mening e'lonlarim
          </h1>
          <p className="text-muted-foreground text-sm">
            {userHouses.length} ta e'lon
          </p>
        </div>

        {/* User Houses */}
        {userHouses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hech qanday e'lon yo'q
            </h3>
            <p className="text-muted-foreground mb-4">
              Birinchi e'loningizni joylashtiring
            </p>
            <Button
              onClick={() => navigate("/new")}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi e'lon
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userHouses.map((house) => (
              <Card
                key={house.id}
                className="shadow-lg border-0 bg-card/80 backdrop-blur-sm overflow-hidden"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {house.images && house.images.length > 0 ? (
                      <img
                        src={house.images[0]}
                        alt="House"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Home className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {house.shahar}, {house.tuman}
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-1">
                          {house.manzil}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary text-xs">
                        ₩{formatPrice(house.oylik)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Square className="w-3 h-3" />
                          <span>{house.xonalar_soni} xona</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{house.qavat}-qavat</span>
                        </div>
                        {house.xonadosh_bolish && (
                          <Badge variant="secondary" className="text-xs">
                            Xonadosh
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteHouse(house.id)}
                        disabled={deletingId === house.id}
                        className="h-7 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
