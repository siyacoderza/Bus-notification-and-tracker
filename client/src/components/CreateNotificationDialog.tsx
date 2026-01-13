import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNotificationSchema, type InsertNotification, type BusRoute } from "@shared/schema";
import { useCreateNotification } from "@/hooks/use-notifications";
import { useRoutes } from "@/hooks/use-routes";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertTriangle } from "lucide-react";

export function CreateNotificationDialog() {
  const [open, setOpen] = useState(false);
  const createNotification = useCreateNotification();
  const { data: routes } = useRoutes();

  const form = useForm<InsertNotification>({
    resolver: zodResolver(insertNotificationSchema),
    defaultValues: {
      type: "info",
      message: "",
      routeId: undefined,
    },
  });

  const onSubmit = (data: InsertNotification) => {
    createNotification.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="shadow-lg shadow-destructive/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <AlertTriangle className="mr-2 h-4 w-4" /> Post Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Broadcast Alert</DialogTitle>
          <DialogDescription>
            Send a real-time notification to subscribers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="info">General Info</SelectItem>
                      <SelectItem value="delay">Delay</SelectItem>
                      <SelectItem value="cancellation">Cancellation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="routeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected Route (Optional)</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "all" ? null : Number(val))} 
                    value={field.value?.toString() || "all"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Routes (System-wide)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Routes (System-wide)</SelectItem>
                      {routes?.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What passengers need to know..." 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              disabled={createNotification.isPending}
            >
              {createNotification.isPending ? "Broadcasting..." : "Broadcast Alert"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
