import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '@/api/axios';

// 서버가 새 공고를 매칭할 때마다 /user/queue/notifications로 보내주는 실시간 알림.
// "지금 화면을 보고 있는 사용자"에게 화면 안에서 실시간으로 알려주는 용도
interface MatchNotification {
  type: string; // 'MATCH' 외 다른 타입이 나중에 추가될 수 있어 string으로 둠
  title: string;
  message: string;
  linkUrl: string;
  createdAt: string;
}

// 앱 전역(MainLayout)에 한 번만 마운트해서 로그인 세션 동안 계속 연결을 유지한다.
export default function MatchNotificationListener() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<MatchNotification | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`, null, { transports: ['websocket', 'xhr-streaming', 'xhr-polling'] }),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message) => {
          let parsed: MatchNotification | null = null;
          try {
            parsed = JSON.parse(message.body);
          } catch {
            console.error('[notification-socket] JSON 파싱 실패:', message.body);
            return;
          }
          if (!parsed) return;

          // 지금은 MATCH 타입만 화면에 표시. 나중에 다른 type이 추가되면
          // 여기서 분기해서 다르게 처리하면 된다.
          if (parsed.type === 'MATCH') {
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
            setToast(parsed);
            dismissTimerRef.current = setTimeout(() => setToast(null), 6000);
          }
        });
      },

      onStompError: (frame) => {
        console.error('[notification-socket] STOMP 에러:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        console.error('[notification-socket] WebSocket 에러:', event);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  if (!toast) return null;

  const handleClick = () => {
    navigate(toast.linkUrl);
    setToast(null);
  };

  return (
    <div className="fixed top-6 right-6 z-[400] w-[340px]">
      <div
        onClick={handleClick}
        className="bg-white rounded-2xl border border-[#EBECFF]/90 shadow-[0_4px_16px_rgba(124,119,255,0.15)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(124,119,255,0.22)] transition-shadow"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-app-text mb-1">{toast.title}</div>
            <div className="text-sm text-app-text-muted truncate">{toast.message}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            className="shrink-0 p-1 text-gray-300 hover:text-gray-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}