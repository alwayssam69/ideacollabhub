
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const accountFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

const notificationsFormSchema = z.object({
  communication_emails: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
  social_emails: z.boolean().default(false),
  security_emails: z.boolean(),
});

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.email || "",
      name: "",
    },
  });
  
  const passwordForm = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    // We'd add proper validation here in a real app
  });
  
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      communication_emails: true,
      marketing_emails: false,
      social_emails: true,
      security_emails: true,
    },
  });

  function onAccountSubmit(data: z.infer<typeof accountFormSchema>) {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Account updated successfully!");
      console.log(data);
    }, 1000);
  }
  
  function onPasswordSubmit(data: any) {
    setIsPasswordChanging(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsPasswordChanging(false);
      toast.success("Password changed successfully!");
      console.log(data);
      passwordForm.reset();
    }, 1000);
  }
  
  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    toast.success("Notification preferences updated!");
    console.log(data);
  }
  
  const handleSignOut = async () => {
    const { success, error } = await signOut();
    
    if (success) {
      toast.success("Signed out successfully");
    } else {
      toast.error("Sign out failed", {
        description: error
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="account" className="max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Account"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all your data.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>
                Sign out from all devices.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    id="current_password"
                    type="password"
                    {...passwordForm.register("current_password")}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>New Password</FormLabel>
                  <Input
                    id="new_password"
                    type="password"
                    {...passwordForm.register("new_password")}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    id="confirm_password"
                    type="password"
                    {...passwordForm.register("confirm_password")}
                  />
                </div>
                <Button type="submit" disabled={isPasswordChanging}>
                  {isPasswordChanging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <FormField
                      control={notificationsForm.control}
                      name="communication_emails"
                      render={({ field }) => (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Communication emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about your account activity.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="marketing_emails"
                      render={({ field }) => (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Marketing emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about new products, features, and more.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="social_emails"
                      render={({ field }) => (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Social emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails for connections, matches, and more.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="security_emails"
                      render={({ field }) => (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Security emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about your account security.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                  </div>
                  <Button type="submit">
                    Update Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
