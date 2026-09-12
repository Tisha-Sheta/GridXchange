import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';
import { api } from '../services/apiClient';
import { Bell, Check, Zap, AlertCircle, Calendar, ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
      if (onNotificationRead) onNotificationRead();
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-100">
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm text-slate-100">Telemetry Notifications</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {loading && notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No telemetry alerts yet</div>
        ) : (
          notifications.map((n) => {
            const isRebalanced = n.type.includes('rebalanced') || n.type.includes('shortfall');
            return (
              <div
                key={n.id}
                className={`p-3 rounded-xl transition-colors flex items-start gap-3 ${
                  n.read_status ? 'bg-transparent opacity-75' : 'bg-slate-900/60'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isRebalanced
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {isRebalanced ? <Zap className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!n.read_status && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
