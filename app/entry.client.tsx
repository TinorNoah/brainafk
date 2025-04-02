/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

// Add WebSocket reconnection handling for development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Create a more resilient WebSocket connection handler without modifying the global object
  const createReconnectingWebSocket = (url: string, protocols?: string | string[]) => {
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
    
    // Add error handling to the page
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && String(event.reason).includes('WebSocket')) {
        event.preventDefault();
        console.warn("Prevented WebSocket error from crashing the page:", event.reason);
      }
    });
  };
  
  // When LiveReload initializes a WebSocket connection, make it more resilient
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
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
