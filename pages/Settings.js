
import React, { useState, useEffect } from "react";
import { UserSettings } from "@/entities/UserSettings";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bell, Clock, Smile, Save, CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";

const commonTimezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Kolkata',
  // Add more common timezones as needed
];

const to12HourFormat = (hour24) => {
  if (hour24 === 0) return { hour: 12, period: 'AM' };
  if (hour24 === 12) return { hour: 12, period: 'PM' };
  if (hour24 < 12) return { hour: hour24, period: 'AM' };
  return { hour: hour24 - 12, period: 'PM' };
};

const to24HourFormat = (hour12, period) => {
  if (period === 'PM' && hour12 < 12) return hour12 + 12;
  if (period === 'AM' && hour12 === 12) return 0;
  return hour12;
};

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications_per_day: 3,
    start_hour: 8,
    end_hour: 20,
    notifications_enabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    newsletter_subscribed: false,
    subscription_email: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [userSettingId, setUserSettingId] = useState(null);
  const [availableTimezones, setAvailableTimezones] = useState(commonTimezones); // State to manage dynamic timezone list

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const user = await User.me();
      const userSettingsList = await UserSettings.list();
      const userSetting = userSettingsList.find(s => s.created_by === user.email);

      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Ensure the detected timezone is in the list of available timezones
      if (!commonTimezones.includes(detectedTimezone) && !availableTimezones.includes(detectedTimezone)) {
        setAvailableTimezones(prev => [detectedTimezone, ...prev]); // Add detected to the top
      } else if (commonTimezones.includes(detectedTimezone) && !availableTimezones.includes(detectedTimezone)) {
        // If it's a common timezone but not in availableTimezones (e.g., initial state), ensure it's there.
        // This case might happen if commonTimezones is not yet fully copied to availableTimezones
        // or if availableTimezones was reset. Given the current structure, it effectively ensures it's shown.
        setAvailableTimezones(commonTimezones); // Reset to base if inconsistent
      }


      if (userSetting) {
        setSettings(userSetting);
        setUserSettingId(userSetting.id);
        if (!userSetting.subscription_email) {
          setSettings(prev => ({...prev, subscription_email: user.email}));
        }
      } else {
        setSettings(prev => ({
          ...prev,
          subscription_email: user.email,
          timezone: detectedTimezone // Set detected timezone as default for new settings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      if (userSettingId) {
        await UserSettings.update(userSettingId, settings);
      } else {
        const newSetting = await UserSettings.create(settings);
        setUserSettingId(newSetting.id);
      }

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsSaving(false);
  };

  const handleTimeChange = (type, part, value) => {
    const isStart = type === 'start';
    const current24Hour = isStart ? settings.start_hour : settings.end_hour;
    const { hour, period } = to12HourFormat(current24Hour);

    let newHour12 = part === 'hour' ? parseInt(value) : hour;
    let newPeriod = part === 'period' ? value : period;

    // Ensure hour is 1-12
    if (newHour12 < 1) newHour12 = 1;
    if (newHour12 > 12) newHour12 = 12;

    const new24Hour = to24HourFormat(newHour12, newPeriod);

    setSettings(prev => ({
      ...prev,
      [isStart ? 'start_hour' : 'end_hour']: new24Hour,
    }));
  };

  const formatHour = (hour) => {
    const { hour: h, period: p } = to12HourFormat(hour);
    return `${h}:00 ${p}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg border-orange-100 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-orange-500" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Notifications</Label>
                <p className="text-sm text-gray-600">Receive daily smile notifications</p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, notifications_enabled: checked }))
                }
              />
            </div>

            {settings.notifications_enabled && (
              <>
                {/* Notifications Per Day */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Daily Smiles</Label>
                    <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-lg">
                      <Smile className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-700">
                        {settings.notifications_per_day}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[settings.notifications_per_day]}
                    onValueChange={(value) =>
                      setSettings(prev => ({ ...prev, notifications_per_day: value[0] }))
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">
                    How many smile notifications you'd like to receive each day
                  </p>
                </div>

                {/* Time Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <Label className="text-base font-medium">Active Hours</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Start Time</Label>
                       <div className="grid grid-cols-2 gap-2 mt-1">
                        <Select
                          value={to12HourFormat(settings.start_hour).hour.toString()}
                          onValueChange={(val) => handleTimeChange('start', 'hour', val)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[...Array(12).keys()].map(i => (
                              <SelectItem key={`start-hour-${i+1}`} value={(i+1).toString()}>{i+1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={to12HourFormat(settings.start_hour).period}
                          onValueChange={(val) => handleTimeChange('start', 'period', val)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">End Time</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Select
                          value={to12HourFormat(settings.end_hour).hour.toString()}
                          onValueChange={(val) => handleTimeChange('end', 'hour', val)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[...Array(12).keys()].map(i => (
                              <SelectItem key={`end-hour-${i+1}`} value={(i+1).toString()}>{i+1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={to12HourFormat(settings.end_hour).period}
                          onValueChange={(val) => handleTimeChange('end', 'period', val)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-base font-medium">Timezone</Label>
                    <Select
                      id="timezone"
                      value={settings.timezone}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimezones.map(tz => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-sm text-gray-600">
                    Notifications will only be sent between {formatHour(settings.start_hour)} and {formatHour(settings.end_hour)}.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg border-orange-100 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-orange-500" />
              Stay Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Subscribe to Newsletter</Label>
                <p className="text-sm text-gray-600">Get updates and happy news from us.</p>
              </div>
              <Switch
                checked={settings.newsletter_subscribed}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, newsletter_subscribed: checked }))
                }
              />
            </div>

            {settings.newsletter_subscribed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={settings.subscription_email || ''}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, subscription_email: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // tailwind classes for Input component
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : savedMessage ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Saved!
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Settings
            </div>
          )}
        </Button>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl p-4 text-center border border-blue-200"
      >
        <div className="text-2xl mb-2">💡</div>
        <h3 className="font-semibold text-gray-800 mb-2">Pro Tip</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Set your active hours to match when you're most likely to need a smile boost.
          Morning coffee time or afternoon breaks work great!
        </p>
      </motion.div>
    </div>
  );
}
