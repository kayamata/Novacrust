"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Globe,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import {
  Card,
  Button,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
} from "@/shared/components/ui";
import { ConfirmDialog } from "@/shared/components/common";
import { useAuth, useAppStore, useTheme } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { cn } from "@/utils/cn";

export function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { updateUser } = useAppStore();
  const { notifications, markAllNotificationsRead } = useAppStore();
  const [tab, setTab] = React.useState<"profile" | "security" | "preferences" | "verification" | "account">("profile");
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  /* Profile */
  const [firstName, setFirstName] = React.useState(user?.firstName ?? "");
  const [lastName, setLastName] = React.useState(user?.lastName ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "+234 803 000 0000");
  const [country, setCountry] = React.useState(user?.country ?? "Nigeria");

  /* Security */
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [biometric, setBiometric] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  /* Preferences */
  const [emailNotifs, setEmailNotifs] = React.useState(true);
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [smsNotifs, setSmsNotifs] = React.useState(false);
  const [defaultCurrency, setDefaultCurrency] = React.useState("USD");
  const { theme: activeTheme, setTheme: setAppTheme, resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setThemeMounted(true), []);

  function saveProfile() {
    setSaving(true);
    setTimeout(() => {
      updateUser({ firstName, lastName, email, phone, country });
      setSaving(false);
      toast.success("Profile updated.");
    }, 800);
  }

  function changePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed.");
    }, 800);
  }

  function doLogout() {
    signOut();
    toast.success("Signed out.");
    router.replace(ROUTES.signin);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="profile"><User className="size-4" />Profile</TabsTrigger>
            <TabsTrigger value="security"><Shield className="size-4" />Security</TabsTrigger>
            <TabsTrigger value="preferences"><Bell className="size-4" />Preferences</TabsTrigger>
            <TabsTrigger value="verification"><CheckCircle2 className="size-4" />Verification</TabsTrigger>
            <TabsTrigger value="account"><Globe className="size-4" />Account</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                  {(user?.firstName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1">Verified</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Personal information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="set-fn">First name</Label>
                  <Input id="set-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="set-ln">Last name</Label>
                  <Input id="set-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="set-email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="set-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-country">Country</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="set-country" value={country} onChange={(e) => setCountry(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Authentication</h3>
              <ToggleRow
                label="Two-factor authentication"
                description="Require a code from your authenticator app."
                checked={twoFactor}
                onCheckedChange={(v) => {
                  setTwoFactor(v);
                  toast.success(v ? "2FA enabled." : "2FA disabled.");
                }}
              />
              <Separator />
              <ToggleRow
                label="Biometric login"
                description="Use Face ID or fingerprint to sign in."
                checked={biometric}
                onCheckedChange={(v) => {
                  setBiometric(v);
                  toast.success(v ? "Biometric enabled." : "Biometric disabled.");
                }}
              />
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Change password</h3>
              <div className="space-y-1.5">
                <Label htmlFor="cur-pw">Current password</Label>
                <div className="relative">
                  <Input
                    id="cur-pw"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New password</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={changePassword} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Update password
              </Button>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="mt-4 space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <ToggleRow label="Email notifications" description="Receive updates by email." checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              <Separator />
              <ToggleRow label="Push notifications" description="Receive updates on your device." checked={pushNotifs} onCheckedChange={setPushNotifs} />
              <Separator />
              <ToggleRow label="SMS notifications" description="Receive updates by text message." checked={smsNotifs} onCheckedChange={setSmsNotifs} />
              {notifications.some((n) => !n.read) && (
                <>
                  <Separator />
                  <Button variant="outline" size="sm" onClick={() => { markAllNotificationsRead(); toast.success("All notifications marked as read."); }}>
                    Mark all as read
                  </Button>
                </>
              )}
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Display</h3>
              <div className="space-y-1.5">
                <Label>Default currency</Label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {["USD", "NGN", "EUR", "GBP"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const html = document.documentElement;
                        html.classList.add("theme-anim");
                        setAppTheme(t);
                        setTimeout(() => html.classList.remove("theme-anim"), 400);
                        toast.success(`Theme set to ${t}.`);
                      }}
                      className={cn(
                        "rounded-lg border py-2 text-sm font-medium capitalize transition-all",
                        (themeMounted ? activeTheme : "system") === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {themeMounted && resolvedTheme && (
                  <p className="text-xs text-muted-foreground">
                    Currently using {resolvedTheme} mode
                    {activeTheme === "system" && " (system)"}
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="mt-4 space-y-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Identity verification</h3>
                  <p className="text-xs text-muted-foreground">Required to unlock higher limits.</p>
                </div>
                <Badge variant="default" className="bg-success/10 text-success">Verified</Badge>
              </div>
              <Separator />
              <VerificationRow label="Email" value={user?.email ?? ""} verified />
              <VerificationRow label="Phone" value={phone} verified />
              <VerificationRow label="Government ID" value="Passport •••• 4521" verified />
              <VerificationRow label="Address" value="Verified" verified />
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Account limits</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily send limit</span>
                  <span className="font-medium text-foreground">$50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly deposit limit</span>
                  <span className="font-medium text-foreground">$250,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card spending limit</span>
                  <span className="font-medium text-foreground">$10,000 / month</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="mt-4 space-y-4">
            <Card className="p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Account</h3>
              <button
                type="button"
                onClick={() => toast.info("Statement export is not available in demo mode.")}
                className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-foreground">Export statement</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <Separator />
              <button
                type="button"
                onClick={() => toast.info("Account closure is not available in demo mode.")}
                className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-destructive">Close account</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </Card>

            <Card className="p-5">
              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => setLogoutOpen(true)}>
                <LogOut className="size-4" />
                Log out
              </Button>
            </Card>

            <p className="px-2 text-center text-xs text-muted-foreground">
              Novacrust v1.0.0 · Demo prototype
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        onConfirm={doLogout}
      />
    </AppShell>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function VerificationRow({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
      {verified && (
        <Badge variant="secondary" className="bg-success/10 text-success">
          <CheckCircle2 className="size-3" />
          Verified
        </Badge>
      )}
    </div>
  );
}
