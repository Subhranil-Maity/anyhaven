import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { getSettings, saveSettings, testConnection } from "@/services/settings";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    qbitUrl: "",
    username: "",
    password: "",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settings && !("error" in settings)) {
      setFormData({
        qbitUrl: settings.qbitUrl || "",
        username: settings.username || "",
        password: "", // never display password
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["qbitStatus"] });
      toast({
        title: "Settings Saved",
        description: "qBittorrent connection settings have been updated.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: testConnection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qbitStatus"] });
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to qBittorrent.",
          variant: "success",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to qBittorrent. Please check your settings.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>qBittorrent Connection</CardTitle>
          </div>
          <CardDescription>
            Enter your qBittorrent WebUI credentials to enable remote downloads.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="qbitUrl">WebUI URL</Label>
                  <Input
                    id="qbitUrl"
                    placeholder="http://localhost:8080"
                    value={formData.qbitUrl}
                    onChange={(e) => setFormData({ ...formData, qbitUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">The full URL to your qBittorrent instance.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to keep existing password.</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/50 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              {testMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button type="submit" disabled={saveMutation.isPending || isLoading}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
