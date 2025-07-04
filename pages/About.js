
import React from "react";
import { Heart, Smile, Globe, Users, Camera, MapPin, Mail, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackForm from "../components/FeedbackForm";

export default function About() {
  const features = [
    {
      icon: Smile,
      title: "Daily Smile Notifications",
      description: "Receive personalized smile notifications throughout your day to brighten your mood"
    },
    {
      icon: Camera,
      title: "Share Your Joy",
      description: "Capture and share your own smiles with the global community"
    },
    {
      icon: Globe,
      title: "Global Smile Map",
      description: "See smiles from around the world and track the spread of happiness"
    },
    {
      icon: Users,
      title: "Safe Community",
      description: "Report inappropriate content to keep our community positive and welcoming"
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-8">
      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Impact Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-6 text-center border border-orange-200"
      >
        <div className="text-4xl mb-3">🌍</div>
        <h3 className="font-semibold text-gray-800 mb-2">Making a Difference</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Join thousands of users worldwide who are spreading joy and positivity through simple acts of sharing smiles.
        </p>
        <div className="flex items-center justify-center gap-2 text-orange-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Active in 50+ countries</span>
        </div>
      </motion.div>

      {/* Developer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <HeartHandshake className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-800">Our Developer</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          MySmileProject is proudly developed by <a href="https://www.mysmileproject.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline"><strong >My Smile Project</strong></a>,
          a non-profit organization dedicated to creating technology that fosters well-being and global connection.
        </p>
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-800">Share Your Thoughts</h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">
          Have an idea for a new feature? Found a bug? We'd love to hear from you. Your feedback helps make MySmileProject better for everyone.
        </p>
        <FeedbackForm />
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center py-6"
      >
        <div className="text-3xl mb-3">✨</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Spread Some Joy?</h3>
        <p className="text-gray-600 text-sm">
          Every smile shared creates a ripple effect of happiness. Start your journey today!
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="text-center py-4 border-t border-orange-100"
      >
        <p className="text-xs text-gray-500 mb-2">
          A non-profit initiative by <a href="https://www.mysmileproject.org" target="_blank" rel="noopener noreferrer" className="hover:underline"><strong className="font-medium">My Smile Project</strong></a>
        </p>
        <p className="text-xs text-gray-400">
          Version 1.0 • MySmileProject
        </p>
      </motion.div>
    </div>
  );
}
