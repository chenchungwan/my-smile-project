import React, { useState, useEffect } from "react";
import { UserSettings } from "@/entities/UserSettings";
import { SmileNotification } from "@/entities/SmileNotification";
import { User } from "@/entities/User";

// Curated smiles from Unsplash
const curatedSmiles = [
  { imageUrl: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A happy golden retriever enjoying the day." },
  { imageUrl: "https://images.unsplash.com/photo-1596423253245-935e45c110cc?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A baby's joyful, heartwarming smile." },
  { imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "Friends sharing a happy moment together." },
  { imageUrl: "https://images.unsplash.com/photo-1616012479905-24955a82193b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A lifetime of happiness in their smiles." },
  { imageUrl: "https://images.unsplash.com/photo-1599443642348-80b182a46c24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A content cat with a subtle, happy smile." },
  { imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A cheerful dog with a big smile." },
  { imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A woman with a genuine, happy smile." },
  { imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A man with a warm, welcoming smile." },
  { imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "Children playing and laughing together." },
  { imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A beautiful sunrise bringing joy to the day." },
  { imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A couple sharing laughter and joy." },
  { imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A child's pure and innocent smile." },
  { imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A happy family moment together." },
  { imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "A man with a confident, warm smile." },
  { imageUrl: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400", description: "Grandparents sharing wisdom and smiles." }
];

export default function NotificationScheduler() {
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    scheduleNotifications();
    const interval = setInterval(checkAndSendNotification, 60000); // Check every minute
    return () => {
      clearInterval(interval);
    };
  }, []);

  const scheduleNotifications = async () => {
    setIsScheduled(true);
  };

  const checkAndSendNotification = async () => {
    try {
      const user = await User.me();
      const settings = await UserSettings.list();
      const userSetting = settings.find(s => s.created_by === user.email);

      if (!userSetting || !userSetting.notifications_enabled) return;

      const now = new Date();
      const currentHour = now.getHours();

      // Check if we're within notification hours
      if (currentHour < userSetting.start_hour || currentHour > userSetting.end_hour) return;

      // Check if we should send a notification based on frequency
      const shouldSend = Math.random() < (userSetting.notifications_per_day / (userSetting.end_hour - userSetting.start_hour + 1));

      if (shouldSend) {
        await sendSmileNotification(userSetting);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const sendSmileNotification = async (settings) => {
    try {
      // Get user location (simulated for demo)
      const location = await getCurrentLocation();

      // Use curated smile list
      const randomSmile = curatedSmiles[Math.floor(Math.random() * curatedSmiles.length)];

      // Create smile notification record
      await SmileNotification.create({
        image_url: randomSmile.imageUrl,
        image_description: randomSmile.description,
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: location.name,
        sent_at: new Date().toISOString()
      });

      // Update last notification sent
      const user = await User.me();
      const userSettingsList = await UserSettings.list();
      const userSetting = userSettingsList.find(s => s.created_by === user.email);

      if (userSetting) {
        await UserSettings.update(userSetting.id, {
          last_notification_sent: new Date().toISOString()
        });
      }

      console.log('Smile notification sent!', randomSmile.description);

    } catch (error) {
      console.error('Error sending smile notification:', error);
    }
  };

  const getCurrentLocation = async () => {
    // Return random locations from around the world for demo
    const cities = [
      { name: "New York, NY", latitude: 40.7128, longitude: -74.0060 },
      { name: "London, UK", latitude: 51.5074, longitude: -0.1278 },
      { name: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503 },
      { name: "Paris, France", latitude: 48.8566, longitude: 2.3522 },
      { name: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
      { name: "São Paulo, Brazil", latitude: -23.5505, longitude: -46.6333 },
      { name: "Mumbai, India", latitude: 19.0760, longitude: 72.8777 },
      { name: "Cairo, Egypt", latitude: 30.0444, longitude: 31.2357 },
      { name: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437 },
      { name: "Toronto, Canada", latitude: 43.6532, longitude: -79.3832 },
      { name: "Berlin, Germany", latitude: 52.5200, longitude: 13.4050 },
      { name: "Bangkok, Thailand", latitude: 13.7563, longitude: 100.5018 }
    ];

    return cities[Math.floor(Math.random() * cities.length)];
  };

  return null; // This is a background component
}
