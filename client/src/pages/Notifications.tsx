import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "@/components/NotificationList";
import { CreateNotificationDialog } from "@/components/CreateNotificationDialog";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import { useOperatorMode } from "@/hooks/use-operator-mode";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { isOperator } = useOperatorMode();
  const { data: allNotifications, isLoading: loadingAll } = useNotifications(false);
  const { data: myNotifications, isLoading: loadingMy } = useNotifications(true);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-secondary" />
              Alert Center
            </h1>
            <p className="text-muted-foreground mt-1">Real-time updates on delays and service changes.</p>
          </div>
          
          {isOperator && <CreateNotificationDialog />}
        </div>

        <Tabs defaultValue={user ? "my-alerts" : "all"} className="w-full">
          <TabsList className="mb-8 w-full sm:w-auto p-1 h-12 bg-white rounded-xl shadow-sm border border-border/50">
            {user && (
              <TabsTrigger value="my-alerts" className="h-10 rounded-lg px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">
                My Routes
              </TabsTrigger>
            )}
            <TabsTrigger value="all" className="h-10 rounded-lg px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">
              System Wide
            </TabsTrigger>
          </TabsList>

          {user && (
            <TabsContent value="my-alerts">
              <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 min-h-[400px]">
                <h2 className="text-xl font-bold mb-6">Alerts for Your Subscriptions</h2>
                <NotificationList notifications={myNotifications || []} loading={loadingMy} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="all">
            <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 min-h-[400px]">
              <h2 className="text-xl font-bold mb-6">All Active System Alerts</h2>
              <NotificationList notifications={allNotifications || []} loading={loadingAll} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
