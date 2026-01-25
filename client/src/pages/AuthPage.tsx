import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      await apiRequest("POST", "/api/auth/otp/send", { phoneNumber: phone });
    },
    onSuccess: () => {
      setStep("otp");
      toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string, code: string }) => {
      await apiRequest("POST", "/api/auth/otp/login", data);
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    loginMutation.mutate({ phoneNumber, code });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/60">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Welcome to MzansiMove</CardTitle>
          <CardDescription>
            {step === "phone" ? "Enter your cellphone number to continue" : "Enter the 6-digit code sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="+27 81 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 text-lg rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold rounded-xl"
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Code"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-12 text-lg text-center tracking-[0.5em] font-bold rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold rounded-xl"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Login"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Change Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
