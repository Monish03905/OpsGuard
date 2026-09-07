import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Loader2, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      setDisplayName(data.display_name ?? "");
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { display_name?: string; avatar_url?: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile.mutateAsync({ avatar_url: urlData.publicUrl + "?t=" + Date.now() });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateProfile.mutate({ display_name: displayName });
  };

  const initials = (profile?.display_name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Account
          </span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
          Profile <span className="bg-accent text-accent-foreground px-2">Settings</span>
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{user?.email}</p>
      </motion.div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-2 border-border bg-card p-6"
      >
        <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Avatar</h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-foreground">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt="Avatar" />
              <AvatarFallback className="bg-muted font-mono text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-mono text-xs text-foreground">Upload a photo</p>
            <p className="font-mono text-[10px] text-muted-foreground">JPG, PNG, or GIF · Max 2MB</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-2 font-mono text-[10px] uppercase tracking-wider"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Choose File"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Display Name Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-2 border-border bg-card p-6"
      >
        <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Display Name</h3>
        <div className="space-y-3">
          <Label htmlFor="displayName" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="border-2 border-border bg-background font-mono text-sm focus:border-foreground"
          />
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending || displayName === (profile?.display_name ?? "")}
            className="border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90"
          >
            {updateProfile.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border-2 border-border bg-card p-6"
      >
        <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Change Password</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="newPassword" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="border-2 border-border bg-background font-mono text-sm focus:border-foreground"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="border-2 border-border bg-background font-mono text-sm focus:border-foreground"
            />
          </div>
          <Button
            onClick={async () => {
              if (newPassword.length < 6) {
                toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
                return;
              }
              if (newPassword !== confirmPassword) {
                toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
                return;
              }
              setChangingPassword(true);
              try {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw error;
                toast({ title: "Password updated", description: "Your password has been changed successfully." });
                setNewPassword("");
                setConfirmPassword("");
              } catch (err: any) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
              } finally {
                setChangingPassword(false);
              }
            }}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90"
          >
            {changingPassword ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lock className="mr-2 h-3.5 w-3.5" />
            )}
            Update Password
          </Button>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-2 border-border bg-card p-6"
      >
        <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Account Info</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</span>
            <span className="font-mono text-xs text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">User ID</span>
            <span className="font-mono text-[10px] text-muted-foreground">{user?.id?.slice(0, 8)}…</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Joined</span>
            <span className="font-mono text-xs text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
