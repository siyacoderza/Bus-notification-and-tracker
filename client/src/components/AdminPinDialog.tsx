import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2, LogOut } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { useToast } from "@/hooks/use-toast";

interface AdminPinDialogProps {
  variant?: "default" | "light";
}

export function AdminPinDialog({ variant = "default" }: AdminPinDialogProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { isAdmin, isVerifying, verifyPin, exitAdminMode } = useAdminMode();
  const { toast } = useToast();
  
  const isLight = variant === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyPin(pin);
    
    if (success) {
      toast({
        title: "Admin Mode Activated",
        description: "You now have full access to manage routes, alerts, and jobs.",
      });
      setPin("");
      setOpen(false);
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please check your PIN and try again.",
        variant: "destructive",
      });
    }
  };

  const handleExit = () => {
    exitAdminMode();
    toast({
      title: "Admin Mode Deactivated",
      description: "You are now in passenger mode.",
    });
  };

  if (isAdmin) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExit}
        className={`gap-2 no-default-hover-elevate ${isLight ? "border-white/30 text-white bg-white/10" : "border-destructive/30 text-destructive"}`}
        data-testid="button-exit-admin"
      >
        <Shield className={`h-4 w-4 ${isLight ? "fill-white/20" : "fill-destructive/20"}`} />
        <span className="hidden sm:inline">Admin</span>
        <LogOut className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 no-default-hover-elevate ${isLight ? "text-white/80 bg-white/5" : "text-muted-foreground"}`}
          data-testid="button-admin-access"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Enter the admin PIN to manage routes, alerts, and job postings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="password"
            placeholder="Enter Admin PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-lg tracking-widest"
            autoFocus
            data-testid="input-admin-pin"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!pin || isVerifying}
            data-testid="button-verify-admin-pin"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Unlock Admin Mode"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminModeIndicator() {
  const { isAdmin } = useAdminMode();
  
  if (!isAdmin) return null;
  
  return (
    <div className="bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
      <Shield className="h-3 w-3" />
      Admin Mode
    </div>
  );
}
