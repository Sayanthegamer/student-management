import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const SyncIndicator = ({ status, onSync, darkMode = false }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: darkMode ? 'text-indigo-400' : 'text-indigo-500',
          text: 'Saving changes...',
          animate: 'animate-spin'
        };
      case 'error':
        return {
          icon: CloudOff,
          color: darkMode ? 'text-rose-400' : 'text-rose-500',
          text: 'Offline mode'
        };
      case 'unsaved':
        return {
          icon: AlertTriangle,
          color: darkMode ? 'text-amber-400' : 'text-amber-500',
          text: 'Unsaved local data'
        };
      case 'synced':
      default:
        return {
          icon: CheckCircle,
          color: darkMode ? 'text-emerald-400' : 'text-emerald-500',
          text: 'All changes saved'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const bgClasses = darkMode
    ? "bg-white/5 border-white/10 backdrop-blur-md"
    : "bg-slate-100 border-slate-200";

  const textClasses = darkMode ? "text-slate-300" : "text-slate-600";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all shadow-inner ${bgClasses}`}>
        <Icon size={12} className={`${config.color} ${config.animate || ''}`} />
        <span className={textClasses}>{config.text}</span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={status === 'syncing' || status === 'synced'}
          className={`p-1.5 rounded-lg transition-all ${
            status === 'syncing' || status === 'synced'
              ? 'text-slate-600 opacity-50 cursor-not-allowed'
              : 'text-indigo-400 hover:bg-indigo-400/10 hover:text-indigo-300 active:scale-95'
          }`}
          title={status === 'synced' ? "Data is up to date" : "Sync data with cloud"}
          aria-label="Synchronize data"
        >
          <RefreshCw size={14} className={status === 'syncing' ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
};

export default SyncIndicator;
