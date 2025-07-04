import React, { useState } from "react";
import { format } from "date-fns";
import { MapPin, Calendar, Heart, Flag, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReportContentModal from "./ReportContentModal";

export default function SmileCard({ smile, index }) {
  const [showReportModal, setShowReportModal] = useState(false);

  if (!smile) return null;

  const description = smile.description || smile.image_description || "A beautiful smile";
  const dateValue = smile.sent_at || smile.created_date;

  const isValidDate = dateValue && !isNaN(new Date(dateValue));
  const formattedDate = isValidDate
    ? format(new Date(dateValue), 'MMM d, yyyy HH:mm')
    : "Date not available";

  const contentType = smile.sent_at ? "smile_notification" : "shared_smile";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={smile.image_url}
              alt={description}
              className="w-20 h-20 rounded-xl object-cover shadow-md"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23fed7aa"/><text x="40" y="45" text-anchor="middle" font-size="30">😊</text></svg>';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {description}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="truncate">{smile.location_name || 'Unknown Location'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-end justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowReportModal(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Heart className="w-5 h-5 text-red-400 fill-current" />
          </div>
        </div>
      </motion.div>

      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={smile.id}
        contentType={contentType}
        contentDescription={description}
      />
    </>
  );
}
