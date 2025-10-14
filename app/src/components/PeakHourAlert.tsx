import { useState, useEffect } from 'react';

type Props = {
  peakHourStart: number; // 18 = 18h
  peakHourEnd: number;   // 21 = 21h
  enabled: boolean;
};

export default function PeakHourAlert({ peakHourStart, peakHourEnd, enabled }: Props) {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isInPeakHour, setIsInPeakHour] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Atualizar hora atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setCurrentHour(hour);
      
      // Resetar dismissed quando sair do horário de pico
      if (hour < peakHourStart || hour >= peakHourEnd) {
        setDismissed(false);
      }
    }, 60000); // Verifica a cada 1 minuto

    return () => clearInterval(interval);
  }, [peakHourStart, peakHourEnd]);

  // Verificar se está no horário de pico
  useEffect(() => {
    if (!enabled) {
      setIsInPeakHour(false);
      return;
    }

    const inPeak = currentHour >= peakHourStart && currentHour < peakHourEnd;
    setIsInPeakHour(inPeak);

    // Mostrar notificação quando entrar no horário de pico
    if (inPeak && !dismissed) {
      setShowNotification(true);
      requestNotificationPermission();
    } else {
      setShowNotification(false);
    }
  }, [currentHour, peakHourStart, peakHourEnd, enabled, dismissed]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Enviar notificação se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('⚠️ Horário de Pico!', {
        body: `São ${currentHour}h - Horário de maior consumo. Evite usar ar-condicionado, chuveiro e eletrodomésticos de alta potência.`,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'peak-hour-alert',
        requireInteraction: false
      });
      
      // Vibrar se disponível (mobile)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowNotification(false);
  };

  if (!isInPeakHour || dismissed) {
    return null;
  }

  return (
    <>
      {/* Banner de alerta fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-40 animate-slide-down">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl animate-pulse">⚠️</div>
              <div className="flex-1">
                <div className="font-semibold text-sm md:text-base">
                  HORÁRIO DE PICO - {currentHour}h às {peakHourEnd}h
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  Evite usar equipamentos de alta potência para economizar na conta!
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      {/* Card de dicas durante horário de pico */}
      {showNotification && (
        <div className="mt-16 mb-4 animate-fade-in">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Dicas para economizar no horário de pico:
                </h3>
                <ul className="text-sm text-orange-800 space-y-1 list-disc pl-5">
                  <li>❄️ Evite usar ar-condicionado (1.400W)</li>
                  <li>🚿 Adie o banho para depois das {peakHourEnd}h (5.500W)</li>
                  <li>🔥 Não use ferro de passar (1.200W)</li>
                  <li>🧺 Não ligue máquina de lavar (500W)</li>
                  <li>👕 Evite secadora (3.500W)</li>
                  <li>🍳 Prefira micro-ondas ao forno elétrico</li>
                </ul>
                
                <div className="mt-3 p-2 bg-white/50 rounded-lg">
                  <div className="text-xs text-orange-900">
                    💰 <strong>Economia estimada:</strong> Deslocando 30% do consumo do pico, 
                    você pode economizar até R$ 50/mês na conta!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

