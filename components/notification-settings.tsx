"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Bell, Mail, AlertTriangle, TrendingUp, TrendingDown, BookOpen, Send, Loader2, Calendar } from "lucide-react"
import { subscribeToNotifications, unsubscribeFromNotifications } from "@/lib/notifications"

interface NotificationSettings {
  email: string
  emailEnabled: boolean
  pushEnabled: boolean
  priceAlerts: boolean
  tradeUpdates: boolean
  journalReminders: boolean
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: "",
    emailEnabled: false,
    pushEnabled: false,
    priceAlerts: true,
    tradeUpdates: true,
    journalReminders: true,
  })

  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")
  const [sendingEmail, setSendingEmail] = useState(false)

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Check if push notifications are supported
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
  }, [settings])

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, email: e.target.value })
  }

  // Toggle email notifications
  const toggleEmailNotifications = (checked: boolean) => {
    if (checked && !isValidEmail(settings.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setSettings({ ...settings, emailEnabled: checked })

    if (checked) {
      toast({
        title: "Email Notifications Enabled",
        description: "You will now receive email notifications",
      })

      // Simulate sending a welcome email
      sendTestEmail(
        "Welcome to Trading Journal",
        "You have successfully enabled email notifications for your trading journal.",
      )
    }
  }

  // Simulate sending an email
  const sendTestEmail = async (subject: string, body: string) => {
    if (!settings.email || !isValidEmail(settings.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setSendingEmail(true)

    try {
      // In a real application, this would be a server action or API call
      // For demo purposes, we'll simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate success
      toast({
        title: "Email Sent",
        description: `Email with subject "${subject}" sent to ${settings.email}`,
      })
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  // Toggle push notifications
  const togglePushNotifications = async (checked: boolean) => {
    if (checked) {
      try {
        // Request permission if not already granted
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission()
          setPushPermission(permission)

          if (permission !== "granted") {
            toast({
              title: "Permission Denied",
              description: "You need to allow notifications in your browser settings",
              variant: "destructive",
            })
            return
          }
        }

        // Subscribe to push notifications
        await subscribeToNotifications()

        setSettings({ ...settings, pushEnabled: true })
        toast({
          title: "Push Notifications Enabled",
          description: "You will now receive push notifications",
        })
      } catch (error) {
        console.error("Error subscribing to push notifications:", error)
        toast({
          title: "Subscription Failed",
          description: "Could not subscribe to push notifications",
          variant: "destructive",
        })
      }
    } else {
      try {
        // Unsubscribe from push notifications
        await unsubscribeFromNotifications()

        setSettings({ ...settings, pushEnabled: false })
        toast({
          title: "Push Notifications Disabled",
          description: "You will no longer receive push notifications",
        })
      } catch (error) {
        console.error("Error unsubscribing from push notifications:", error)
      }
    }
  }

  // Toggle notification types
  const toggleNotificationType = (
    type: keyof Pick<NotificationSettings, "priceAlerts" | "tradeUpdates" | "journalReminders">,
  ) => {
    setSettings({ ...settings, [type]: !settings[type] })
  }

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Test notification
  const sendTestNotification = () => {
    if (settings.pushEnabled && Notification.permission === "granted") {
      const notification = new Notification("Trading Journal Test", {
        body: "This is a test notification from your Trading Journal",
        icon: "/favicon.ico",
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    toast({
      title: "Test Notification Sent",
      description: settings.pushEnabled
        ? "A push notification has been sent"
        : "Push notifications are disabled. Enable them to receive notifications.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Configure how and when you want to be notified about your trades</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-medium">Email Notifications</h3>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={toggleEmailNotifications}
              disabled={!settings.email && !settings.emailEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={settings.email}
              onChange={handleEmailChange}
            />
            <p className="text-sm text-muted-foreground">We'll send notifications to this email address</p>
          </div>

          {settings.emailEnabled && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">Test Email Notifications</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sendingEmail}
                  onClick={() =>
                    sendTestEmail(
                      "Price Alert",
                      "EUR/USD has reached your target price of 1.0850. Log in to your Trading Journal to view details.",
                    )
                  }
                >
                  {sendingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  )}
                  Send Price Alert
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={sendingEmail}
                  onClick={() =>
                    sendTestEmail(
                      "Trading Journal Reminder",
                      "Don't forget to log your trades for today. Maintaining a consistent journal is key to improving your trading performance.",
                    )
                  }
                >
                  {sendingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                  )}
                  Send Reminder
                </Button>
              </div>

              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={sendingEmail}
                  onClick={() =>
                    sendTestEmail(
                      "Test Email",
                      "This is a test email from your Trading Journal. If you received this, your email notifications are working correctly.",
                    )
                  }
                >
                  {sendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Test Email
                </Button>
              </div>

              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">How Email Notifications Work</p>
                <p className="text-muted-foreground">
                  In a production environment, emails would be sent through a secure email service. For this demo, we're
                  simulating email sending functionality.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-medium">Push Notifications</h3>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) => {
                togglePushNotifications(checked)

                // Send a welcome notification when enabled
                if (checked && Notification.permission === "granted") {
                  const notification = new Notification("Notifications Enabled", {
                    body: "You will now receive trading alerts and updates",
                    icon: "/favicon.ico",
                  })

                  notification.onclick = () => {
                    window.focus()
                    notification.close()
                  }
                }
              }}
              disabled={!pushSupported}
            />
          </div>

          {!pushSupported && (
            <div className="flex items-center p-3 text-sm border rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Push notifications are not supported in your browser</p>
            </div>
          )}

          {pushSupported && pushPermission === "denied" && (
            <div className="flex items-center p-3 text-sm border rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Notifications are blocked. Please update your browser settings to allow notifications.</p>
            </div>
          )}

          {pushSupported && settings.pushEnabled && (
            <div className="space-y-3">
              <Button variant="outline" size="sm" onClick={sendTestNotification}>
                Send Test Notification
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const notification = new Notification("Price Alert", {
                      body: "EUR/USD has reached your target price of 1.0850",
                      icon: "/favicon.ico",
                    })

                    notification.onclick = () => {
                      window.focus()
                      notification.close()
                    }

                    toast({
                      title: "Price Alert Sent",
                      description: "A sample price alert notification was sent",
                    })
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  Send Price Alert
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const notification = new Notification("Journal Reminder", {
                      body: "Don't forget to log your trades for today",
                      icon: "/favicon.ico",
                    })

                    notification.onclick = () => {
                      window.focus()
                      notification.close()
                    }

                    toast({
                      title: "Reminder Sent",
                      description: "A sample journal reminder notification was sent",
                    })
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                  Send Reminder
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">What to Notify Me About</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <Label htmlFor="price-alerts" className="cursor-pointer">
                  Economic Events
                </Label>
              </div>
              <Switch
                id="price-alerts"
                checked={settings.priceAlerts}
                onCheckedChange={() => toggleNotificationType("priceAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-blue-500" />
                <Label htmlFor="trade-updates" className="cursor-pointer">
                  Trade Updates
                </Label>
              </div>
              <Switch
                id="trade-updates"
                checked={settings.tradeUpdates}
                onCheckedChange={() => toggleNotificationType("tradeUpdates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <Label htmlFor="journal-reminders" className="cursor-pointer">
                  Journal Reminders
                </Label>
              </div>
              <Switch
                id="journal-reminders"
                checked={settings.journalReminders}
                onCheckedChange={() => toggleNotificationType("journalReminders")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

