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
import { Bus, Loader2, LogOut } from "lucide-react";
import { useDriverMode } from "@/hooks/use-driver-mode";
import { useToast } from "@/hooks/use-toast";

interface DriverPinDialogProps {
  variant?: "default" | "light";
}

export function DriverPinDialog({ variant = "default" }: DriverPinDialogProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { isDriver, isVerifying, verifyPin, exitDriverMode } = useDriverMode();
  const { toast } = useToast();
  
  const isLight = variant === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyPin(pin);
    
    if (success) {
      toast({
        title: "Driver Mode Activated",
        description: "You can now mark your bus availability on routes.",
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
    exitDriverMode();
    toast({
      title: "Driver Mode Deactivated",
      description: "You are now in passenger mode.",
    });
  };

  if (isDriver) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExit}
        className={`gap-2 no-default-hover-elevate ${isLight ? "border-white/30 text-white bg-white/10" : "border-primary/30 text-primary"}`}
        data-testid="button-exit-driver"
      >
        <Bus className={`h-4 w-4 ${isLight ? "fill-white/20" : "fill-primary/20"}`} />
        <span className="hidden sm:inline">Driver</span>
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
          data-testid="button-driver-access"
        >
          <Bus className="h-4 w-4" />
          <span className="hidden sm:inline">Driver</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            Driver Access
          </DialogTitle>
          <DialogDescription>
            Enter your driver PIN to mark your bus availability on routes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-lg tracking-widest"
            autoFocus
            data-testid="input-driver-pin"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!pin || isVerifying}
            data-testid="button-verify-driver-pin"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Unlock Driver Mode"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DriverModeIndicator() {
  const { isDriver } = useDriverMode();
  
  if (!isDriver) return null;
  
  return (
    <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
      <Bus className="h-3 w-3" />
      Driver Mode
    </div>
  );
}
