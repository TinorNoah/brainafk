import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "BrainAFK - Coming Soon" },
    { name: "description", content: "Something exciting is coming soon!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400">
          Brain<span className="text-gray-800 dark:text-gray-100">AFK</span>
        </h1>
        
        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
          Coming Soon
        </h2>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
          We&apos;re working on something exciting. Stay tuned for updates!
        </p>
        
        <div className="mt-8">
          <a 
            href="mailto:tinornoah@gmail.com" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Notified When We Launch
          </a>
        </div>
      </div>
    </div>
  );
}
