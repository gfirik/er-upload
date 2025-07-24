import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { House } from "@/types/house";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Users, Home, Square, Layers, Plus, User } from "lucide-react";

interface FilterState {
  shahar: string;
  tuman: string;
  minPrice: string;
  maxPrice: string;
  xonadoshRequired: boolean;
}

export default function HomePage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    shahar: "all",
    tuman: "all",
    minPrice: "",
    maxPrice: "",
    xonadoshRequired: false,
  });

  // Get unique cities and districts for filters
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houses, filters]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHouses(data || []);

      // Extract unique cities and districts
      const uniqueCities = [
        ...new Set(data?.map((house) => house.shahar) || []),
      ];
      const uniqueDistricts = [
        ...new Set(data?.map((house) => house.tuman) || []),
      ];

      setCities(uniqueCities);
      setDistricts(uniqueDistricts);
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...houses];

    if (filters.shahar && filters.shahar !== "all") {
      filtered = filtered.filter((house) => house.shahar === filters.shahar);
    }

    if (filters.tuman && filters.tuman !== "all") {
      filtered = filtered.filter((house) => house.tuman === filters.tuman);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (house) => house.oylik >= parseInt(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (house) => house.oylik <= parseInt(filters.maxPrice)
      );
    }

    if (filters.xonadoshRequired) {
      filtered = filtered.filter((house) => house.xonadosh_bolish === true);
    }

    setFilteredHouses(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      shahar: "all",
      tuman: "all",
      minPrice: "",
      maxPrice: "",
      xonadoshRequired: false,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handleCardClick = (houseId: string) => {
    navigate(`/house/${houseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Uylar ro'yxati
            </h1>
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30"
          >
            <User className="w-4 h-4" />
            Sahifam
          </Button>

          <Button
            onClick={() => navigate("/new")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Yangi e'lon
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Select
                value={filters.shahar}
                onValueChange={(value) =>
                  updateFilter("shahar", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="min-w-[140px] bg-input border border-border/50">
                  <SelectValue placeholder="Shahar" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-background border border-border shadow-md rounded-md">
                  <SelectItem value="all">Barcha shaharlar</SelectItem>
                  {cities.map((city) => (
                    <SelectItem
                      key={city}
                      value={city}
                      className="hover:bg-muted focus:bg-muted"
                    >
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.tuman}
                onValueChange={(value) =>
                  updateFilter("tuman", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="min-w-[140px] bg-input border border-border/50">
                  <SelectValue placeholder="Tuman" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-background border border-border shadow-md rounded-md">
                  <SelectItem value="all">Barcha tumanlar</SelectItem>
                  {districts.map((district) => (
                    <SelectItem
                      key={district}
                      value={district}
                      className="hover:bg-muted focus:bg-muted"
                    >
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                className="min-w-[120px] bg-input border-border/50"
                placeholder="Min narx"
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />

              <Input
                className="min-w-[120px] bg-input border-border/50"
                placeholder="Max narx"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />

              <Button
                variant={filters.xonadoshRequired ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateFilter("xonadoshRequired", !filters.xonadoshRequired)
                }
                className={`min-w-[120px] border-border/50 transition-all duration-200 ${
                  filters.xonadoshRequired
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-input hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                <Users className="w-3 h-3 mr-1" />
                {filters.xonadoshRequired ? "Xonadosh kerak" : "Xonadosh"}
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="min-w-[100px] border-border/50"
              >
                Tozalash
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Header  */}
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl mb-4 shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div> */}
          {/* <h1 className="text-2xl font-bold text-foreground mb-2">
            Uylar ro'yxati
          </h1> */}
          <p className="text-muted-foreground">
            Bizda jami {filteredHouses.length} ta uy topildi
          </p>
        </div>

        {/* Houses Grid */}
        {filteredHouses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Uy topilmadi
            </h3>
            <p className="text-muted-foreground">
              Filtrlarni o'zgartirib qayta urinib ko'ring
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <Card
                key={house.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm overflow-hidden"
                onClick={() => handleCardClick(house.id)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {house.images && house.images.length > 0 ? (
                    <img
                      src={house.images[0]}
                      alt="House"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Home className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {house.xonadosh_bolish && (
                      <Badge className="bg-primary/90 text-white text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Xonadosh
                      </Badge>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/80 text-white font-semibold">
                      ₩{formatPrice(house.oylik)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {house.shahar}, {house.tuman}
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-foreground font-medium line-clamp-2">
                    {house.manzil}
                  </p>

                  {/* House Details */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      <span>{house.xonalar_soni} xona</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{house.qavat}-qavat</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      Garov: ₩{formatPrice(house.garov_puli)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
