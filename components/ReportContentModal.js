import React, { useState } from "react";
import { ContentReport } from "@/entities/ContentReport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flag, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportContentModal({ isOpen, onClose, contentId, contentType, contentDescription }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons = [
    { value: "inappropriate", label: "Inappropriate content", description: "Contains adult or inappropriate material" },
    { value: "offensive", label: "Offensive content", description: "Contains hate speech or offensive material" },
    { value: "spam", label: "Spam", description: "Irrelevant or repetitive content" },
    { value: "not_smile", label: "Not a smile", description: "Content doesn't contain a smile or happy moment" },
    { value: "other", label: "Other", description: "Other reason not listed above" }
  ];

  const handleSubmit = async () => {
    if (!reason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await ContentReport.create({
        reported_content_type: contentType,
        reported_content_id: contentId,
        report_reason: reason,
        additional_details: details
      });

      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setReason("");
    setDetails("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Report Content
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600 text-sm">
              Thank you for helping keep our community safe. We'll review this content shortly.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Content Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Reporting:</p>
              <p className="font-medium text-gray-800 truncate">{contentDescription}</p>
            </div>

            {/* Reason Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Why are you reporting this content?
              </Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {reasons.map((r) => (
                  <div key={r.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor={r.value} className="font-medium text-sm cursor-pointer">
                        {r.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Details */}
            <div>
              <Label htmlFor="details" className="text-base font-medium">
                Additional details (optional)
              </Label>
              <Textarea
                id="details"
                placeholder="Provide any additional context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-2 min-h-[80px]"
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Please report responsibly</p>
                <p className="text-amber-700 mt-1">
                  False reports may result in restrictions on your account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Report
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
