/**
 * WebSocket utility functions for improved connection handling
 */

/**
 * Creates a reconnecting WebSocket that will attempt to reconnect after connection loss
 * Particularly useful for development environments with HMR
 */
export const createReconnectingWebSocket = (url: string, protocols?: string | string[]) => {
  let ws: WebSocket | null = new WebSocket(url, protocols);
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Event handlers with proper typing
  type WebSocketEventType = keyof WebSocketEventMap;
  const eventListeners: Record<WebSocketEventType, Array<EventListener>> = {
    message: [],
    close: [],
    error: [],
    open: []
  };
  
  // Configure reconnection
  const setupReconnection = () => {
    ws?.addEventListener('close', () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      // Only reconnect if this is a Remix dev server WebSocket
      if (url.includes('localhost') && url.includes('/socket')) {
        console.log("WebSocket closed. Reconnecting in 1s...");
        reconnectTimeout = setTimeout(() => {
          console.log("Attempting to reconnect to Remix dev server...");
          try {
            // Create a new connection
            ws = new WebSocket(url, protocols);
            
            // Reattach all event listeners
            Object.entries(eventListeners).forEach(([type, listeners]) => {
              listeners.forEach(listener => {
                ws?.addEventListener(type as WebSocketEventType, listener);
              });
            });
            
            // Set up reconnection for the new WebSocket
            setupReconnection();
          } catch (error) {
            console.error("Failed to reconnect:", error);
          }
        }, 1000);
      }
    });
    
    // Suppress errors to prevent crashes
    ws?.addEventListener('error', (event) => {
      console.warn("WebSocket error - attempting to handle gracefully:", event);
    });
  };
  
  // Initial setup
  setupReconnection();
  
  return {
    ws,
    addEventListener: <K extends WebSocketEventType>(
      type: K, 
      listener: (ev: WebSocketEventMap[K]) => void | unknown
    ) => {
      ws?.addEventListener(type, listener as EventListener);
      eventListeners[type].push(listener as EventListener);
    },
    removeEventListener: <K extends WebSocketEventType>(
      type: K, 
      listener: (ev: WebSocketEventMap[K]) => void | unknown
    ) => {
      ws?.removeEventListener(type, listener as EventListener);
      const index = eventListeners[type].indexOf(listener as EventListener);
      if (index > -1) {
        eventListeners[type].splice(index, 1);
      }
    },
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      ws?.send(data);
    },
    close: (code?: number, reason?: string) => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      ws?.close(code, reason);
    }
  };
};

/**
 * Sets up error handling for WebSocket connections to prevent app crashes
 */
export const setupWebSocketErrorHandling = () => {
  if (typeof window === 'undefined') return;
  
  // Add error handling to the page
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && String(event.reason).includes('WebSocket')) {
      event.preventDefault();
      console.warn("Prevented WebSocket error from crashing the page:", event.reason);
    }
  });
  
  // Patch fetch to enhance WebSocket connections when they're created
  const patchFetchForLiveReload = () => {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const result = await originalFetch(...args);
      
      // After fetching any resource, check if there's a new WebSocket to localhost
      setTimeout(() => {
        try {
          if (args[0] && typeof args[0] === 'string' && args[0].includes('livereload')) {
            // Find the WebSocket connection to localhost
            const wsUrl = 'ws://localhost:8002/socket';
            createReconnectingWebSocket(wsUrl);
          }
        } catch (e) {
          // Ignore errors in our enhancement logic
        }
      }, 100);
      
      return result;
    };
  };
  
  // Only apply in development
  if (process.env.NODE_ENV === "development") {
    patchFetchForLiveReload();
  }
};