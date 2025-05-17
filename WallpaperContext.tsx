import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface WallpaperContextType {
  wallpaper: string | null;
  setWallpaper: (url: string | null) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

const WALLPAPER_STORAGE_KEY = 'audiobook_wallpaper';

export const WallpaperProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallpaper, setWallpaperState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(WALLPAPER_STORAGE_KEY);
      return stored ? stored : null;
    } catch {
      return null;
    }
  });

  const setWallpaper = (url: string | null) => {
    setWallpaperState(url);
    try {
      if (url) {
        localStorage.setItem(WALLPAPER_STORAGE_KEY, url);
      } else {
        localStorage.removeItem(WALLPAPER_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist wallpaper to localStorage:', error);
    }
  };

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (context === undefined) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
}; 