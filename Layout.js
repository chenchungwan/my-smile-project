
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Settings, Map, Smile, Info } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navigationItems = [
    { name: "Home", url: createPageUrl("Home"), icon: Home },
    { name: "Map", url: createPageUrl("MapPage"), icon: Map },
    { name: "About", url: createPageUrl("About"), icon: Info },
    { name: "Settings", url: createPageUrl("Settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <style>
        {`
          :root {
            --smile-primary: #f59e0b;
            --smile-secondary: #fbbf24;
            --smile-accent: #fb923c;
            --smile-warm: #fed7aa;
            --smile-light: #fef3c7;
          }
        `}
      </style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">😊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                MySmileProject
              </h1>
              <p className="text-xs text-orange-600/70">Happiness, one smile at a time.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-orange-100 z-50">
        <div className="max-w-md mx-auto px-2">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                      : "text-orange-600/70 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
