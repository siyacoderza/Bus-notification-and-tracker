import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRoutes } from "@/hooks/use-routes";
import { RouteCard } from "@/components/RouteCard";
import { CreateRouteDialog } from "@/components/CreateRouteDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, ChevronRight, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminMode } from "@/hooks/use-admin-mode";

type Province = {
  id: number;
  name: string;
  code: string;
};

type Municipality = {
  id: number;
  name: string;
  provinceId: number;
  type: string;
  code: string | null;
  province: Province;
};

export default function RoutesPage() {
  const { user } = useAuth();
  const { isAdmin } = useAdminMode();
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [search, setSearch] = useState("");

  const { data: provinces, isLoading: loadingProvinces } = useQuery<Province[]>({
    queryKey: ["/api/provinces"],
  });

  const { data: municipalities, isLoading: loadingMunicipalities } = useQuery<Municipality[]>({
    queryKey: ["/api/municipalities", selectedProvince?.id],
    queryFn: async () => {
      const url = selectedProvince 
        ? `/api/municipalities?provinceId=${selectedProvince.id}` 
        : "/api/municipalities";
      const res = await fetch(url);
      return res.json();
    },
    enabled: !!selectedProvince,
  });

  const { data: routes, isLoading: loadingRoutes } = useRoutes(
    selectedMunicipality ? "" : search
  );

  const filteredRoutes = routes?.filter(r => {
    // If municipality is selected, show only routes for that municipality
    if (selectedMunicipality) {
      return r.municipalityId === selectedMunicipality.id;
    }
    
    // If there's a search term, search across all routes
    if (search) {
      const searchLower = search.toLowerCase();
      return r.name.toLowerCase().includes(searchLower) ||
        r.startLocation.toLowerCase().includes(searchLower) ||
        r.endLocation.toLowerCase().includes(searchLower) ||
        r.operatingCompany.toLowerCase().includes(searchLower);
    }
    
    // Default: show all routes when on home/province selection
    return true;
  });

  const handleBack = () => {
    if (selectedMunicipality) {
      setSelectedMunicipality(null);
    } else if (selectedProvince) {
      setSelectedProvince(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {(selectedProvince || selectedMunicipality) && (
                <Button variant="ghost" size="icon" onClick={handleBack} data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                Find My Route
              </h1>
            </div>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span 
                className={`cursor-pointer hover:text-primary ${!selectedProvince ? 'text-primary font-medium' : ''}`}
                onClick={() => { setSelectedProvince(null); setSelectedMunicipality(null); }}
              >
                All Provinces
              </span>
              {selectedProvince && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span 
                    className={`cursor-pointer hover:text-primary ${selectedProvince && !selectedMunicipality ? 'text-primary font-medium' : ''}`}
                    onClick={() => setSelectedMunicipality(null)}
                  >
                    {selectedProvince.name}
                  </span>
                </>
              )}
              {selectedMunicipality && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-primary font-medium">{selectedMunicipality.name}</span>
                </>
              )}
            </div>
          </div>
          
          {isAdmin && selectedMunicipality && <CreateRouteDialog />}
        </div>

        {/* Global Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all routes by name, location, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-routes"
            />
          </div>
        </div>

        {/* Show search results when there's a search term */}
        {search && (
          <>
            <p className="text-lg text-muted-foreground mb-4">
              {filteredRoutes?.length || 0} route{filteredRoutes?.length !== 1 ? 's' : ''} found for "{search}"
            </p>
            
            {loadingRoutes ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRoutes && filteredRoutes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} showAdminControls={isAdmin} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No routes found matching "{search}"</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </>
        )}

        {/* Step 1: Select Province (only when not searching) */}
        {!selectedProvince && !search && (
          <>
            <p className="text-lg text-muted-foreground mb-6">Select your province to find bus routes in your area, or search above.</p>
            
            {loadingProvinces ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {provinces?.map((province) => (
                  <Card 
                    key={province.id}
                    className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                    onClick={() => setSelectedProvince(province)}
                    data-testid={`province-${province.code}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{province.code}</Badge>
                        <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                          {province.name}
                        </h3>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Select Municipality (only when not searching) */}
        {selectedProvince && !selectedMunicipality && !search && (
          <>
            <p className="text-lg text-muted-foreground mb-6">
              Select your municipality in {selectedProvince.name}.
            </p>
            
            {loadingMunicipalities ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {municipalities?.map((municipality) => (
                  <Card 
                    key={municipality.id}
                    className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                    onClick={() => setSelectedMunicipality(municipality)}
                    data-testid={`municipality-${municipality.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge 
                          variant={municipality.type === 'metro' ? 'default' : 'outline'}
                          className="mb-2"
                        >
                          {municipality.type === 'metro' ? 'Metro' : 'District'}
                        </Badge>
                        <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                          {municipality.name}
                        </h3>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: View Routes (only when not using global search) */}
        {selectedMunicipality && !search && (
          <>
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                className="pl-12 h-12 rounded-xl bg-white border-border/60 shadow-sm text-lg"
                placeholder="Search routes in this municipality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-route-search-page"
              />
            </div>

            {loadingRoutes ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoutes?.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No routes found in {selectedMunicipality.name}.</p>
                    <p className="text-sm text-muted-foreground mt-2">Routes will appear here once operators add them.</p>
                  </div>
                ) : (
                  filteredRoutes?.map((route) => (
                    <RouteCard key={route.id} route={route} showAdminControls={user?.role === 'admin'} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
