
import React, { useState, useEffect } from "react";
import { SmileNotification } from "@/entities/SmileNotification";
import { SharedSmile } from "@/entities/SharedSmile";
import { User } from "@/entities/User";
import SmileCard from "../components/SmileCard";
import ShareSmileModal from "../components/ShareSmileModal";
import { Filter, User as UserIcon, Bell, Plus, Globe, ChevronLeft, ChevronRight, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { subDays, startOfDay, endOfDay, format, addHours, differenceInHours } from "date-fns";

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [mySharedSmiles, setMySharedSmiles] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [notifications, mySharedSmiles, allItems, searchTerm, timeFilter, activeTab]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const user = await User.me();

      const twoDaysAgo = subDays(new Date(), 2).toISOString();
      const twelveHoursAgo = subDays(new Date(), 0.5).toISOString();

      const [allNotifications, allSharedSmiles, mySmiles] = await Promise.all([
        SmileNotification.list('-sent_at', 100),
        SharedSmile.list('-created_date', 100),
        SharedSmile.filter({ created_by: user.email }, '-created_date', 100)
      ]);

      const filterFlagged = (item) => {
        if (!item.is_flagged || item.admin_reviewed) return true;
        const hoursSinceFlagged = differenceInHours(new Date(), new Date(item.flagged_at));
        return hoursSinceFlagared < 12;
      };

      const safeNotifications = (allNotifications || []).filter(filterFlagged);
      const safeAllShared = (allSharedSmiles || []).filter(filterFlagged);
      const safeMySmiles = (mySmiles || []).filter(filterFlagged);

      setNotifications(safeNotifications);
      setMySharedSmiles(safeMySmiles);

      const combined = [...safeNotifications, ...safeAllShared].sort((a, b) =>
        new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date)
      );
      setAllItems(combined);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let sourceItems;
    if (activeTab === 'received') sourceItems = notifications;
    else if (activeTab === 'shared') sourceItems = mySharedSmiles;
    else sourceItems = allItems;

    let filtered = [...(sourceItems || [])];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.image_description || item.description)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const dateField = item.sent_at || item.created_date;
        if (!dateField) return false;
        const itemDate = new Date(dateField);
        if (timeFilter === "today") return itemDate >= startOfDay(now) && itemDate <= endOfDay(now);
        if (timeFilter === "week") return itemDate >= subDays(now, 7);
        if (timeFilter === "month") return itemDate >= subDays(now, 30);
        return false;
      });
    }
    setFilteredItems(filtered);
  };

  const noContentMessage = () => {
    if (searchTerm || timeFilter !== "all") {
        return { title: "No smiles found", message: "Try adjusting your search or time filter" };
    }
    if (activeTab === 'received') return { title: "No smiles yet", message: "Your received smiles will appear here." };
    if (activeTab === 'shared') return { title: "You haven't shared any smiles", message: "Tap the + button to share your first smile!" };
    return { title: "No smiles to show", message: "Check back later for smiles from the app and the community!" };
  };

  const handleShareSuccess = () => {
    loadHistory();
  };

  const swipeTo = (newIndex) => {
    if (newIndex < 0 || newIndex >= notifications.length) return;
    setCurrentSwipeIndex(newIndex);
  };

  const currentSmile = notifications[currentSwipeIndex];

  return (
    <div className="max-w-md mx-auto">
      <div className="relative w-full aspect-square bg-black group overflow-hidden">
        <AnimatePresence initial={false}>
          {isLoading ? (
            <motion.div
              key="loader"
              className="absolute inset-0 bg-orange-100 animate-pulse"
              initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
          ) : notifications.length > 0 && currentSmile ? (
            <motion.img
              key={currentSwipeIndex}
              src={currentSmile.image_url}
              alt={currentSmile.image_description}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key="placeholder"
              className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-200 flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl flex items-center justify-center shadow-xl mb-4">
                <Smile className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-orange-800">Welcome to MySmileProject!</h3>
              <p className="text-orange-700/90 text-sm mt-2">
                Your first smile notification is on its way.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && notifications.length > 0 && currentSmile && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-xl drop-shadow-lg">{currentSmile.image_description}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm opacity-90 drop-shadow-md">
                <span>{currentSmile.location_name}</span>
                <span>{format(new Date(currentSmile.sent_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            {currentSwipeIndex > 0 && (
              <Button onClick={() => swipeTo(currentSwipeIndex - 1)} variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20">
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}
            {currentSwipeIndex < notifications.length - 1 && (
              <Button onClick={() => swipeTo(currentSwipeIndex + 1)} variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20">
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </>
        )}
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 bg-orange-100">
              <TabsTrigger value="received" className="flex items-center gap-2"><Bell className="w-4 h-4" /> Received</TabsTrigger>
              <TabsTrigger value="shared" className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> My Shares</TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2"><Globe className="w-4 h-4" /> All</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "shared" && (
            <Button
              onClick={() => setShowShareModal(true)}
              className="ml-3 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/70 backdrop-blur-sm border-orange-200"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm border-orange-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Smiles List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white/50 rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === "shared" ? "📸" : "🔍"}
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{noContentMessage().title}</h3>
              <p className="text-gray-500 text-sm">{noContentMessage().message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <SmileCard key={item.id} smile={item} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <ShareSmileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSuccess={handleShareSuccess}
      />
    </div>
  );
}
