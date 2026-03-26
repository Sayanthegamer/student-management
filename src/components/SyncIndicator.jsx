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

  const bgClasses = "bg-[#0a0a0a] border-white/20";
  const textClasses = "text-white/70";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-none border-2 text-[10px] font-black uppercase tracking-widest transition-all min-w-[140px] ${bgClasses}`}>
        <Icon size={12} className={`${config.color} ${config.animate || ''} stroke-[3px]`} />
        <span className={textClasses}>{config.text}</span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={status === 'syncing' || status === 'synced'}
          className={`p-2 rounded-none border-2 transition-all ${status === 'syncing' || status === 'synced'
              ? 'border-white/10 text-white/20 cursor-not-allowed'
              : 'border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black active:scale-95'
            }`}
          title={status === 'synced' ? "Data is up to date" : "Sync data with cloud"}
          aria-label="Synchronize data"
        >
          <RefreshCw size={14} className={`${status === 'syncing' ? 'animate-spin' : ''} stroke-[3px]`} />
        </button>
      )}
    </div>
  );
};

export default SyncIndicator;
