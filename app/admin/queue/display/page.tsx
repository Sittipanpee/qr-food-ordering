'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/mock-api';
import { Order, Settings } from '@/lib/types';
import { format } from 'date-fns';

export default function QueueDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastReadyCount, setLastReadyCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadData();

    // Auto-refresh every 2-3 seconds
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    // Play beep when new order becomes ready
    const readyOrders = orders.filter((o) => o.status === 'ready');
    if (readyOrders.length > lastReadyCount) {
      playBeepSound();
    }
    setLastReadyCount(readyOrders.length);
  }, [orders]);

  const loadData = async () => {
    try {
      const [queueOrders, settingsData] = await Promise.all([
        api.queue.getActiveQueue(),
        api.settings.get(),
      ]);

      setOrders(queueOrders);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const playBeepSound = () => {
    // Play multiple beeps for attention
    if (typeof window !== 'undefined') {
      const beep = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77dmHAU4k9nyz3omBSh+zPLaizsKFGGz6+utVxMJQ6Hn8bllHgcsgc/y2Yk2CBxqvvPmnE0MDlCq5O+3Zx4GOJTb8s98JgYngMzy2os7ChVhtevurVgSCUOh6PKzZB8HK4HN8tiJNggba77y5ZxODA5PqOPvuGceCDiU2/LPfCgFKIDL8dmLOwsUYbXp7axWEwlCoe3zsmQgCCuBzvHYijgIG2q+8+ScTgwPT6jh7rhkHgk4lNvzz3omByeBzfPaizwLFGC25vCsVxIJQ6Ht9LFlIAgrgs/y2Ik3CBxqvvTlm04MDk+n4e+2ZSEJOJTa88p1KwYogMrz2ow9DBVgtejxrlcSCkGh7vW0ZSEKKoLO8tiKOAgcar3z5JtOCw5Pp+HvtWUhCTmU2vPKdSsHKIDJ89uNPAwUYLTm8a1WEgpBoe71s2QiCiiCzvLYijcIG2m+9eSaThAOTqfe8bZlIQo5lNrzynb6ChVhtujxrVYSCkGh7vOwYyQLKILL8diKNwkcab3y45pQCw5Pp9/xtmMkCzqU2vLJdSwGKIDJ8tuMPQsUX7Tl8a1ZEQpBn+/2smUlCiiCzfLYiTgJHGm+8uObThAOTqfg8bVlJQs6lNrxyXUsCSiAyPPbjDwLFGC06fStWREKQZ/v9LRlIgoofs/y2Yk4CBxpvvLkmlELDk2n3/K1ZiYMOZTb88p1LAYpgMny24w8DBRftujzrFgSCT+f7/K2ZicKKIHN8tmKNwgcar300pxQCw1No+H0tmclCTmU2/PKdSwHKX/I8tqLPQwUX7Xn8atZEgpBn+/ztGYnCSeBy/Lajz0MHGq+8+OaUQsOTaPh9LhmKAo5k9r0yXUtCSiBx/LajTwNFV+16POnWRMKQJ7w9rVmJworgs/w2Is6CRxqvvTkm1EKDUym4fS4aCkLOJTa9Ml1LgYpgcnz2ow8DRVftejyqlkSCkGe8Pa1ZigKKoLO8tmLOwkcarzz45tRCw1MpuH0uWgpCzmT2vPJdS4HKYHJl9qMPQwVYLXo8q1ZEglAnO/3tmgpCimCzvLZjTsMHGq88uKbUQwOTKfh87loKQs5k9rzqHQuCCl/yPLbjD0MFV+06PKvWRIKQZ7u9rZoKQspgc/y2Yw6CxxqvPPinFEMDkym4PO5aCkLOZPa9Kl0LwgqgMnz24w9CxVetujyq1kTCkCd7/e2aSkLKYHO8tmMOwocarzz4p1RDA5LpuH0uWgpCzqT2fOpdC8IKYHI89uMPg0UX7Xo8qxZEwpAnu/3t2gpCyqBzvLZjDsMG2m78uKeUQwOTKfh87loKQo5k9n0qXQvByqAyPPbjD0NFV+16PKsWRMKP57v97hnKgspgc/y2Y48DBtpvfPinFAMDkyn4PK4Zykq+ZPZ9Kl0LgYqf8nz2ow+DBVfta==');
        audio.play().catch(console.error);
      };

      beep();
      setTimeout(beep, 200);
      setTimeout(beep, 400);
    }
  };

  const preparingOrders = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'confirmed'
  );
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          {settings?.restaurant_name || 'Queue Display'}
        </h1>
        <p className="text-3xl text-gray-300">
          {format(currentTime, 'HH:mm:ss')} • {format(currentTime, 'dd MMM yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Preparing Section */}
        <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse"></span>
              Preparing
            </h2>
            <span className="text-5xl font-bold text-orange-500">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {preparingOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="bg-gray-700/50 rounded-2xl p-6 border-l-4 border-l-orange-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Queue Number</p>
                    <p className="text-5xl font-bold text-orange-400">
                      {order.queue_number}
                    </p>
                  </div>
                  {order.customer_name && (
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">Customer</p>
                      <p className="text-xl font-medium">{order.customer_name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {preparingOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-2xl">No orders preparing</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready Section */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur rounded-3xl p-8 border-2 border-green-500/50 animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-green-500 animate-ping"></span>
              Ready for Pickup
            </h2>
            <span className="text-5xl font-bold text-green-400">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {readyOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="bg-green-600/30 rounded-2xl p-6 border-2 border-green-400 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-200 mb-1">Queue Number</p>
                    <p className="text-6xl font-bold text-green-300 animate-bounce">
                      {order.queue_number}
                    </p>
                  </div>
                  {order.customer_name && (
                    <div className="text-right">
                      <p className="text-sm text-green-200 mb-1">Customer</p>
                      <p className="text-2xl font-bold text-white">{order.customer_name}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-green-400/30">
                  <p className="text-green-200 text-center text-xl font-semibold">
                    PLEASE COLLECT YOUR ORDER
                  </p>
                </div>
              </div>
            ))}

            {readyOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-2xl">No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-xl">
          Please wait for your queue number to be called
        </p>
        <p className="text-gray-500 mt-2">
          Auto-refreshing every 2.5 seconds
        </p>
      </div>
    </div>
  );
}
