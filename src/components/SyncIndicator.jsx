import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const SyncIndicator = ({ status, darkMode = false }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: darkMode ? 'text-indigo-400' : 'text-indigo-500',
          text: 'Syncing...',
          animate: 'animate-spin'
        };
      case 'error':
        return {
          icon: CloudOff,
          color: darkMode ? 'text-rose-400' : 'text-rose-500',
          text: 'Sync Error'
        };
      case 'unsaved':
        return {
          icon: AlertTriangle,
          color: darkMode ? 'text-amber-400' : 'text-amber-500',
          text: 'Unsaved Changes'
        };
      case 'synced':
      default:
        return {
          icon: CheckCircle,
          color: darkMode ? 'text-emerald-400' : 'text-emerald-500',
          text: 'Synced'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const bgClasses = darkMode
    ? "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
    : "bg-slate-100 border-slate-200";

  const textClasses = darkMode ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${bgClasses}`}>
      <Icon size={14} className={`${config.color} ${config.animate || ''}`} />
      <span className={textClasses}>{config.text}</span>
    </div>
  );
};

export default SyncIndicator;
