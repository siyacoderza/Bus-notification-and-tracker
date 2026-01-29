import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Search, Phone, Mail, MapPin, Store, Loader2, CheckCircle, XCircle, Trash2, Shield } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MarketplaceProduct, MarketplaceVendor } from "@shared/schema";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "snacks", label: "Snacks" },
  { value: "drinks", label: "Drinks" },
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data" },
  { value: "accessories", label: "Accessories" },
  { value: "services", label: "Services" },
];

function formatPrice(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { isAdmin } = useAdminMode();
  const { toast } = useToast();

  const { data: products = [], isLoading: productsLoading } = useQuery<(MarketplaceProduct & { vendor: MarketplaceVendor })[]>({
    queryKey: ["/api/marketplace/products"],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<MarketplaceVendor[]>({
    queryKey: ["/api/marketplace/vendors"],
  });

  const { data: allVendors = [], isLoading: allVendorsLoading } = useQuery<MarketplaceVendor[]>({
    queryKey: ["/api/marketplace/admin/vendors"],
    enabled: isAdmin,
  });

  const approveVendor = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      await apiRequest("PUT", `/api/marketplace/admin/vendors/${id}/approve`, { approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/vendors"] });
      toast({ title: "Vendor status updated" });
    },
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/marketplace/admin/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/products"] });
      toast({ title: "Vendor deleted" });
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const isLoading = productsLoading || vendorsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Marketplace
        </h1>
        <p className="text-muted-foreground">
          Browse products and services from local vendors along your route
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-marketplace-search"
          />
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" data-testid="tab-admin" className="text-amber-600">
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                data-testid={`button-category-${cat.value}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new products from local vendors"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                  {product.imageUrl && (
                    <div className="aspect-square overflow-hidden rounded-t-md">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {product.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Store className="h-4 w-4" />
                      <span>{product.vendor.businessName}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => window.location.href = `tel:${product.vendor.phone}`}
                      data-testid={`button-contact-vendor-${product.id}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Vendor
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          {vendorsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No vendors yet</h3>
              <p className="text-muted-foreground">
                Be the first to register as a vendor!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.filter(v => 
                v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.description?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((vendor) => (
                <Card key={vendor.id} className="hover-elevate" data-testid={`card-vendor-${vendor.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      {vendor.businessName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                    <Badge variant="outline">{vendor.category}</Badge>
                    <div className="space-y-1 text-sm">
                      {vendor.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{vendor.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{vendor.email}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => window.location.href = `tel:${vendor.phone}`}
                      data-testid={`button-call-vendor-${vendor.id}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Vendor
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Admin Mode - Manage Marketplace Vendors</span>
                </div>
              </CardContent>
            </Card>

            {allVendorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : allVendors.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No vendor applications</h3>
                <p className="text-muted-foreground">
                  Vendors will appear here when they register
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Vendors ({allVendors.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allVendors.map((vendor) => (
                    <Card key={vendor.id} data-testid={`admin-vendor-card-${vendor.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            {vendor.businessName}
                          </CardTitle>
                          <div className="flex gap-1">
                            {vendor.isApproved ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                                Pending
                              </Badge>
                            )}
                            {!vendor.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{vendor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{vendor.phone}</span>
                        </div>
                        {vendor.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{vendor.location}</span>
                          </div>
                        )}
                        <Badge variant="outline">{vendor.category}</Badge>
                      </CardContent>
                      <CardFooter className="flex gap-2 flex-wrap">
                        {!vendor.isApproved ? (
                          <Button
                            size="sm"
                            onClick={() => approveVendor.mutate({ id: vendor.id, approved: true })}
                            disabled={approveVendor.isPending}
                            data-testid={`button-approve-vendor-${vendor.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveVendor.mutate({ id: vendor.id, approved: false })}
                            disabled={approveVendor.isPending}
                            data-testid={`button-revoke-vendor-${vendor.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Delete vendor "${vendor.businessName}" and all their products?`)) {
                              deleteVendor.mutate(vendor.id);
                            }
                          }}
                          disabled={deleteVendor.isPending}
                          data-testid={`button-delete-vendor-${vendor.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
