import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { useEffect } from "react";

// Import the CSS file properly without using a default export
import tailwindStylesUrl from "./tailwind.css?url";

// Define a function to get the CSS bundle href
const getCssBundleHref = (): string | undefined => {
  // In a browser environment, we can't use dynamic imports at the module level
  // Instead, just return undefined and let the app work without the CSS bundle
  return undefined;
};

// Get CSS bundle href using our safe function
const cssBundleHref = getCssBundleHref();

export const links: LinksFunction = () => [
  // Use the imported URL directly instead of accessing a default export
  { rel: "stylesheet", href: tailwindStylesUrl },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  const location = useLocation();

  // Add global error handling for WebSocket connections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent WebSocket connection errors from crashing the app
      if (event.reason && 
          (String(event.reason).includes('WebSocket') || 
           String(event.reason).includes('socket'))) {
        
        // Prevent the error from bubbling up
        event.preventDefault();
        console.warn("WebSocket connection issue - handled gracefully:", event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Reset scroll position on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* Removed LiveReload component - Vite has its own HMR runtime */}
      </body>
    </html>
  );
}

// Error boundaries for handling runtime errors
export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <button 
              onClick={() => window.location.href = "/"}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Go back home
            </button>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
