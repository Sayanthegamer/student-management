import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const SyncIndicator = ({ status, onSync, darkMode = false }) => {
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
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${bgClasses}`}>
        <Icon size={14} className={`${config.color} ${config.animate || ''}`} />
        <span className={textClasses}>{config.text}</span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={status === 'syncing'}
          className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors flex items-center gap-1 ${
            status === 'syncing'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          title="Force save to cloud"
        >
          <RefreshCw size={12} className={status === 'syncing' ? 'animate-spin' : ''} />
          {status === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
};

export default SyncIndicator;
