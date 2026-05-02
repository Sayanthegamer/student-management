import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';


/**
 * SyncIndicator Component
 * 
 * @returns {JSX.Element} The rendered component.
 */
const SyncIndicator = ({ status, onSync }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-indigo-400',
          text: 'Saving changes...',
          animate: 'animate-spin'
        };
      case 'error':
        return {
          icon: CloudOff,
          color: 'text-rose-400',
          text: 'Offline mode'
        };
      case 'unsaved':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          text: 'Unsaved local data'
        };
      case 'synced':
      default:
        return {
          icon: CheckCircle,
          color: 'text-emerald-400',
          text: 'All changes saved'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const bgClasses = "bg-[var(--bg-main)] border-[var(--border-color)]";
  const textClasses = "text-[var(--text-secondary)]";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all min-w-[140px] ${bgClasses}`}>
        <Icon size={14} className={`${config.color} ${config.animate || ''}`} />
        <span className={textClasses}>{config.text}</span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={status === 'syncing' || status === 'synced'}
          className={`p-1.5 rounded-md border transition-all ${status === 'syncing' || status === 'synced'
              ? 'border-[var(--border-color)] bg-transparent text-[var(--border-color)] cursor-not-allowed'
              : 'border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] active:scale-95'
            }`}
          title={status === 'synced' ? "Data is up to date" : "Sync data with cloud"}
          aria-label="Synchronize data"
        >
          <RefreshCw size={14} className={`${status === 'syncing' ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default SyncIndicator;
