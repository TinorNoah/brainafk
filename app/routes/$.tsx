import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Catch-all route to handle requests that don't match any other routes
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Handle Chrome DevTools well-known endpoint
  if (url.pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return json({}, { status: 404 });
  }
  
  // For all other unmatched routes, throw a 404
  throw new Response("Not Found", { status: 404 });
}

// This component won't be rendered for the DevTools endpoint since we return early in the loader
export default function CatchAll() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-400">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
