
import React, { useState, useEffect } from "react";
import { SmileNotification } from "@/entities/SmileNotification";
import { SharedSmile } from "@/entities/SharedSmile";
import SmileMap from "../components/SmileMap";
import NotificationScheduler from "../components/NotificationScheduler";
import { Sparkles, Globe, Smile } from "lucide-react";
import { motion } from "framer-motion";

export default function MapPage() {
  const [notifications, setNotifications] = useState([]);
  const [sharedSmiles, setSharedSmiles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    loadSmiles();
    const interval = setInterval(loadSmiles, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSmiles = async () => {
    try {
      const [allNotifications, allSharedSmiles] = await Promise.all([
        SmileNotification.list('-sent_at', 500).catch(() => []),
        SharedSmile.list('-created_date', 500).catch(() => [])
      ]);

      setNotifications(allNotifications || []);
      setSharedSmiles(allSharedSmiles || []);

      const notificationCount = allNotifications ? allNotifications.length : 0;
      const sharedCount = allSharedSmiles ? allSharedSmiles.length : 0;
      setTotalCount(notificationCount + sharedCount);

      // Calculate today's count safely
      const today = new Date().toDateString();
      let todaySmileCount = 0;

      if (allNotifications) {
        todaySmileCount += allNotifications.filter(smile =>
          smile.sent_at && new Date(smile.sent_at).toDateString() === today
        ).length;
      }

      if (allSharedSmiles) {
        todaySmileCount += allSharedSmiles.filter(smile =>
          smile.created_date && new Date(smile.created_date).toDateString() === today
        ).length;
      }

      setTodayCount(todaySmileCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading smiles:', error);
      setNotifications([]);
      setSharedSmiles([]);
      setTotalCount(0);
      setTodayCount(0);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <NotificationScheduler />

      {/* Map Section - Now constrained to match other components */}
      <div className="max-w-md mx-auto px-4">
        {isLoading ? (
          <div className="h-[400px] bg-white/50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-4">
                <Smile className="w-8 h-8 text-white" />
              </div>
              <div className="text-gray-500">Loading smiles...</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden shadow-lg border border-orange-100">
            <SmileMap
              notifications={notifications}
              sharedSmiles={sharedSmiles}
              totalCount={totalCount}
            />
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-orange-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Global Smiles</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{totalCount.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total All Time</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-orange-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Today's Smiles</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{todayCount}</div>
            <div className="text-xs text-gray-500">App & Community</div>
          </div>
        </motion.div>

        {/* Impact Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-6 text-center border border-orange-200"
        >
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="font-semibold text-gray-800 mb-2">Making the World Smile</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every notification you receive helps spread joy to someone, somewhere in the world.
            Together, we're creating a global network of happiness.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
