import React, { useState, useEffect } from "react";
import { Feedback } from "@/entities/Feedback";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const user = await User.me();
        if (user && user.email) {
          setEmail(user.email);
        }
      } catch (e) {
        // User not logged in, which is fine.
      }
    };
    fetchUserEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackType || !message || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await Feedback.create({
        feedback_type: feedbackType,
        message: message,
        contact_email: email,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackType("");
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError("Sorry, something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 bg-green-50 border border-green-200 rounded-xl"
      >
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-green-800">Thank You!</h3>
        <p className="text-sm text-green-700">Your feedback has been sent. We appreciate you helping us improve!</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="feedback-type">Feedback Type</Label>
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger id="feedback-type" className="mt-1">
              <SelectValue placeholder="Select a type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature_request">New Feature Request</SelectItem>
              <SelectItem value="bug_report">Report a Bug</SelectItem>
              <SelectItem value="general_feedback">General Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Your Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your experience or idea..."
          required
          rows={5}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Contact Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">We'll only use this to follow up on your feedback.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting || !feedbackType || !message} className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Feedback
          </>
        )}
      </Button>
    </form>
  );
}
