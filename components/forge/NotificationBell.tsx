"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Shield, Trophy, CheckCircle, Activity, UserPlus, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type NotificationRecord = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

type SquadParams = {
  name: string;
} | null;

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<string | null>(null);

  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial user session
    const setup = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      const userId = authData.user.id;
      setSessionUser(userId);

      // 2. Fetch initial unread notifications
      const { data } = await supabase
        .from('forge_notifications')
        .select('*')
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const safeData = data.map(n => ({
          ...n,
          is_read: n.is_read || false,
          created_at: n.created_at || new Date().toISOString()
        })) as NotificationRecord[];
        setNotifications(safeData);
        setUnreadCount(safeData.filter(n => !n.is_read).length);
      }

      // 3. Subscribe to Realtime Insertion Events
      const channel = supabase
        .channel(`public:forge_notifications`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'forge_notifications',
            filter: `candidate_id=eq.${userId}`
          },
          (payload) => {
            const rawNotif = payload.new as any;
            const newNotif: NotificationRecord = {
               ...rawNotif,
               is_read: rawNotif.is_read || false,
               created_at: rawNotif.created_at || new Date().toISOString()
            };
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((count) => count + 1);
            
            // Optional: Play a sound or show a toast here.
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setup();
  }, [supabase]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    // Optimistically update
    setNotifications((prev) => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    // Database push
    await supabase.from('forge_notifications').update({ is_read: true }).eq('id', id);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'challenge_live': return <Activity className="w-5 h-5 text-rose-500" />;
      case 'rank_change': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'hired': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'revealed': return <Shield className="w-5 h-5 text-primary" />;
      case 'squad_invite': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'streak_reminder': return <Flame className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // If no user is logged in, don't render bell
  if (!sessionUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surface-hover transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white dark:border-background"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[85vh] overflow-y-auto custom-scrollbar bg-surface/90 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl z-50 flex flex-col animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-surface/80 backdrop-blur-md z-10">
             <h3 className="font-bold flex items-center gap-2 text-foreground">
               <Bell className="w-4 h-4 text-primary" /> Notifications
             </h3>
             {unreadCount > 0 && (
                <span className="text-xs font-mono bg-primary/20 text-primary-light px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
             )}
          </div>

          <div className="flex flex-col py-2">
            {notifications.length === 0 ? (
               <div className="px-6 py-10 text-center flex flex-col items-center">
                  <Shield className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-mono text-muted-foreground">Inbox is empty.<br/>The Forge slumbers.</p>
               </div>
            ) : (
               notifications.map((n) => (
                 <div
                   key={n.id}
                   onClick={() => markAsRead(n.id, n.is_read)}
                   className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-hover/80 transition-colors cursor-pointer block ${!n.is_read ? 'bg-primary/5' : ''}`}
                 >
                   <Link href={n.link || "#"} className="flex items-start gap-4">
                      <div className="shrink-0 pt-1">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-grow">
                         <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-sm ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                               {n.title}
                            </h4>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 ml-2" />}
                         </div>
                         <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.body}</p>
                         <span className="text-[10px] text-muted-foreground/50 font-mono mt-2 block">
                            {timeAgo(n.created_at)}
                         </span>
                      </div>
                   </Link>
                 </div>
               ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
