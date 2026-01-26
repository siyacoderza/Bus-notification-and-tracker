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
import { useOperatorMode } from "@/hooks/use-operator-mode";
import { useToast } from "@/hooks/use-toast";

interface OperatorPinDialogProps {
  variant?: "default" | "light";
}

export function OperatorPinDialog({ variant = "default" }: OperatorPinDialogProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { isOperator, isVerifying, verifyPin, exitOperatorMode } = useOperatorMode();
  const { toast } = useToast();
  
  const isLight = variant === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyPin(pin);
    
    if (success) {
      toast({
        title: "Operator Mode Activated",
        description: "You now have access to operator features.",
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
    exitOperatorMode();
    toast({
      title: "Operator Mode Deactivated",
      description: "You are now in passenger mode.",
    });
  };

  if (isOperator) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExit}
        className={`gap-2 ${isLight ? "border-white/30 text-white hover:bg-white/10" : "border-primary/30 text-primary"}`}
        data-testid="button-exit-operator"
      >
        <Shield className={`h-4 w-4 ${isLight ? "fill-white/20" : "fill-primary/20"}`} />
        <span className="hidden sm:inline">Operator</span>
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
          className={`gap-2 ${isLight ? "text-white/80 hover:text-white hover:bg-white/10" : "text-muted-foreground"}`}
          data-testid="button-operator-access"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Operator</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Operator Access
          </DialogTitle>
          <DialogDescription>
            Enter the operator PIN to access route management and alert features.
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
            data-testid="input-operator-pin"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!pin || isVerifying}
            data-testid="button-verify-pin"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Unlock Operator Mode"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OperatorModeIndicator() {
  const { isOperator } = useOperatorMode();
  
  if (!isOperator) return null;
  
  return (
    <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
      <Shield className="h-3 w-3" />
      Operator Mode
    </div>
  );
}
