import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Phone,
  Home,
  Square,
  Layers,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface House {
  id: string; // Changed from number to string for UUID
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

export default function House() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Validate that it looks like a UUID (basic check)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        fetchHouse(id);
      } else {
        console.error("Invalid UUID format:", id);
        setError(`Invalid house ID format: ${id}`);
        setLoading(false);
      }
    } else {
      setError("No house ID provided");
      setLoading(false);
    }
  }, [id]);

  const fetchHouse = async (houseId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching house with ID:", houseId); // Debug log

      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .eq("id", houseId)
        .single();

      console.log("Supabase response:", { data, error }); // Debug log

      if (error) {
        console.error("Supabase error:", error);
        setError(`Error fetching house: ${error.message}`);
        return;
      }

      if (!data) {
        setError("House not found");
        return;
      }

      setHouse(data);
    } catch (error) {
      console.error("Error fetching house:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nextImage = () => {
    if (house?.images && house.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === house.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (house?.images && house.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? house.images.length - 1 : prev - 1
      );
    }
  };

  const handleCall = () => {
    if (house?.contact?.phone) {
      window.open(`tel:${house.contact.phone}`, "_self");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6">
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {error || "Uy topilmadi"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {error
                ? "Uy ma'lumotlarini yuklashda xatolik yuz berdi."
                : "Kechirasiz, bu uy mavjud emas yoki o'chirilgan."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga qaytish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="pb-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {house.images && house.images.length > 0 ? (
            <>
              <img
                src={house.images[currentImageIndex]}
                alt="House"
                className="w-full h-full object-cover"
              />

              {house.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {house.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Home className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/80 text-white font-bold text-lg px-3 py-1">
              ₩{formatPrice(house.oylik)}/oy
            </Badge>
          </div>

          {/* Roommate Badge */}
          {house.xonadosh_bolish && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/90 text-white">
                <Users className="w-3 h-3 mr-1" />
                Xonadosh kerak
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {house.manzil}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>
                      {house.shahar}, {house.tuman}
                    </span>
                  </div>
                </div>
              </div>

              {/* House Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Square className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-medium">
                    {house.xonalar_soni}
                  </div>
                  <div className="text-xs text-muted-foreground">Xonalar</div>
                </div>
                <div className="text-center">
                  <Layers className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-medium">{house.qavat}</div>
                  <div className="text-xs text-muted-foreground">Qavat</div>
                </div>
                <div className="text-center">
                  <Home className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-medium">
                    ₩{formatPrice(house.garov_puli)}
                  </div>
                  <div className="text-xs text-muted-foreground">Garov</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-sm font-medium">
                    {formatDate(house.created_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    E'lon sanasi
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {house.tavsif && (
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">Tavsif</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {house.tavsif}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Aloqa</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCall}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300 p-2"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {house.contact?.phone || "Qo'ng'iroq qilish"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Qo'shimcha ma'lumotlar
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Oylik to'lov</span>
                  <span className="font-medium">
                    ₩{formatPrice(house.oylik)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Garov puli</span>
                  <span className="font-medium">
                    ₩{formatPrice(house.garov_puli)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Xonalar soni</span>
                  <span className="font-medium">{house.xonalar_soni} ta</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Qavat</span>
                  <span className="font-medium">{house.qavat}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Xonadosh</span>
                  <span className="font-medium">
                    {house.xonadosh_bolish ? "Kerak" : "Kerak emas"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
