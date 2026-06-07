'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createWS, type WSMessage } from './api';

interface UseWSOptions<T> {
  path: string;
  fallbackFetch: () => Promise<T[]>;
  onUpdate?: (prev: T[], msg: WSMessage) => T[];
}

export function useWS<T extends { id: number }>({
  path,
  fallbackFetch,
  onUpdate,
}: UseWSOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      switch (msg.type) {
        case 'initial':
          setData(Array.isArray(msg.data) ? (msg.data as T[]) : []);
          setLoading(false);
          break;
        case 'update':
          if (onUpdate) {
            setData((prev) => onUpdate(prev, msg));
          } else if (msg.id != null && msg.field != null) {
            setData((prev) =>
              prev.map((item) =>
                item.id === msg.id
                  ? { ...item, [msg.field!]: msg.value }
                  : item,
              ),
            );
          }
          break;
        case 'insert':
          if (Array.isArray(msg.data)) {
            setData((prev) => [...prev, ...(msg.data as T[])]);
          }
          break;
      }
    },
    [onUpdate],
  );

  useEffect(() => {
    mountedRef.current = true;
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = createWS(path);
        wsRef.current = ws;

        ws.onopen = () => {
          setLoading(false);
        };

        ws.onmessage = (event) => {
          if (!mountedRef.current) return;
          const msg: WSMessage = JSON.parse(event.data);
          handleMessage(msg);
        };

        ws.onerror = () => {
          setLoading(false);
        };

        ws.onclose = () => {
          if (!mountedRef.current) return;
          reconnectRef.current = setTimeout(connect, 3000);
        };
      } catch {
        doFallback();
      }
    };

    const doFallback = async () => {
      try {
        const result = await fallbackFetch();
        if (mountedRef.current) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch {
        // keep existing data
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    connect();

    const fallbackTimer = setTimeout(() => {
      if (
        mountedRef.current &&
        (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      ) {
        doFallback();
      }
    }, 2000);

    return () => {
      mountedRef.current = false;
      clearTimeout(fallbackTimer);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [path, fallbackFetch, handleMessage]);

  return { data, setData, loading };
}
