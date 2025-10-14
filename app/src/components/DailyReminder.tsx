import { useEffect, useState } from 'react';

type Props = {
  enabled: boolean;
  reminderHour: number; // 21 = 21h
};

export default function DailyReminder({ enabled, reminderHour }: Props) {
  const [hasRegisteredToday, setHasRegisteredToday] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Verificar se já registrou hoje
    const checkIfRegisteredToday = () => {
      const hoje = new Date().toISOString().slice(0, 10);
      const registrosRaw = localStorage.getItem('registrosDiarios');
      
      if (registrosRaw) {
        const registros = JSON.parse(registrosRaw);
        const registroHoje = registros.find((r: any) => r.data === hoje);
        setHasRegisteredToday(!!registroHoje);
      }
    };

    // Verificar a cada minuto
    checkIfRegisteredToday();
    const interval = setInterval(() => {
      const agora = new Date();
      const horaAtual = agora.getHours();

      checkIfRegisteredToday();

      // Enviar lembrete no horário configurado
      if (horaAtual === reminderHour && !hasRegisteredToday) {
        sendReminder();
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [enabled, reminderHour, hasRegisteredToday]);

  const sendReminder = async () => {
    // Solicitar permissão se necessário
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Enviar notificação
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📝 Lembre-se de registrar!', {
        body: 'Não esqueça de registrar o consumo de energia de hoje. Leva apenas 2 minutos!',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'daily-reminder',
        requireInteraction: false
      });

      // Vibrar se disponível
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // Este componente não renderiza nada visualmente
  return null;
}

