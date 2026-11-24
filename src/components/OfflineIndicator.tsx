import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = React.memo(() => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-700/95 text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-500/40 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
      <span>Modo Sin Conexión — El Sidur y los audios guardados siguen disponibles.</span>
    </div>
  );
});
