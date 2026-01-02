import { type Notification } from "@shared/schema";
import { format } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface NotificationListProps {
  notifications: (Notification & { routeName?: string })[];
  loading?: boolean;
}

export function NotificationList({ notifications, loading }: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/5">
        <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold font-display text-foreground">All Clear</h3>
        <p className="text-muted-foreground">There are no active alerts at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => {
        const isCritical = ['cancellation', 'emergency', 'delay'].includes(notification.type);
        const Icon = isCritical ? AlertCircle : Info;
        
        return (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-5 rounded-2xl border transition-all hover:shadow-md
              ${isCritical 
                ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10' 
                : 'bg-white border-border hover:bg-muted/30'
              }
            `}
          >
            <div className="flex gap-4">
              <div className={`
                shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${isCritical ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}
              `}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-wider opacity-70">
                      {notification.type}
                    </span>
                    {notification.routeName && (
                      <Badge variant="outline" className="bg-background/50">
                        {notification.routeName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {notification.createdAt && format(new Date(notification.createdAt), "MMM d, h:mm a")}
                  </div>
                </div>
                
                <p className="text-base font-medium leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
