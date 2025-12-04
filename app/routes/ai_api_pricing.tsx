import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ArtificialAnalysisAPI, transformToChartData } from "../lib/artificial-analysis-api";
import { parseCsv } from "../lib/csv-parser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Fallback CSV data
const csvData = `Name,Input,Output
Gemini 2.0 Flash-Lite,$0.075,$0.30
Mistral 3.1 Small,$0.10,$0.30
Gemini 2.0 Flash,$0.10,$0.40
ChatGPT 4.1-nano,$0.10,$0.40
DeepSeek v3 (old),$0.14,$0.28
ChatGPT 4o-mini,$0.15,$0.60
DeepSeek v3,$0.27,$1.10
Grok 3-mini,$0.30,$0.50
ChatGPT 4.1-mini,$0.40,$1.60
DeepSeek r1,$0.55,$2.19
ChatGPT o3-mini,$1.10,$4.40
Gemini 2.5 Pro,$1.25,$10.00
ChatGPT 4.1,$2.00,$8.00
ChatGPT 4o,$2.50,$10.00
Claude 3.5 Sonnet,$3.00,$15.00
Grok 3,$3.00,$15.00
ChatGPT o1,$15.00,$60.00
ChatGPT 4.5,$75.00,$150.00
O1 Pro,$150.00,$600.00`;

// Define a type for the model data
interface ModelData {
  name: string;
  Input: number;
  Output: number;
  creator?: string;
  intelligenceIndex?: number;
  codingIndex?: number;
  mathIndex?: number;
  speed?: number;
}

interface LoaderData {
  models: ModelData[];
  error?: string;
  lastUpdated?: string;
}

// Server-side loader function
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const api = ArtificialAnalysisAPI.getInstance();

    // Check if this is a refresh request
    const url = new URL(request.url);
    const refresh = url.searchParams.get("refresh") === "true";

    if (refresh) {
      await api.clearCache();
    }

    const models = await api.getModels();
    const chartData = transformToChartData(models);

    const cacheInfo = await api.getCacheInfo();

    return json<LoaderData>({
      models: chartData,
      lastUpdated: cacheInfo.lastUpdated?.toISOString(),
    });
  } catch (error) {
    console.error('Error loading AI model data:', error);

    // Fallback to CSV data
    const fallbackData = (parseCsv(csvData) as Record<string, string>[]).map(
      (item) => ({
        name: item.Name,
        Input: parseFloat(item.Input.replace("$", "")),
        Output: parseFloat(item.Output.replace("$", "")),
      })
    );

    return json<LoaderData>({
      models: fallbackData,
      error: 'Failed to load live data from API. Using fallback data.',
    });
  }
}

export default function AIAPIPricingPage() {
  const { models, error, lastUpdated } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ModelData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [displayMode, setDisplayMode] = useState<string>("both");
  const [sortBy, setSortBy] = useState<string>("price_low");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Hardcoded list of "latest/popular" models for default selection
  const LATEST_MODELS = [
    "GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "Llama 3.1 405B",
    "DeepSeek V3", "Mistral Large 2", "Grok 2", "GPT-4o mini",
    "Gemini 1.5 Flash", "Llama 3.1 70B"
  ];

  // Initialize selected models when data loads
  useEffect(() => {
    const currentModels = fetcher.data?.models || models;
    // Filter to find models that match our "latest" list (fuzzy match or exact)
    const defaultSelection = currentModels
      .filter(m => LATEST_MODELS.some(latest => m.name.includes(latest)))
      .map(m => m.name);

    // If we found matches, use them. Otherwise fallback to all (or first 10)
    if (defaultSelection.length > 0) {
      setSelectedModels(defaultSelection);
    } else {
      setSelectedModels(currentModels.slice(0, 15).map(m => m.name));
    }
  }, [models, fetcher.data]);

  // Update filtered data when selection changes
  useEffect(() => {
    const currentModels = fetcher.data?.models || models;
    let filtered = currentModels.filter((item) => selectedModels.includes(item.name));

    // Apply sorting
    if (sortBy === "price_low") {
      filtered.sort((a, b) => a.Input - b.Input);
    } else if (sortBy === "price_high") {
      filtered.sort((a, b) => b.Input - a.Input);
    } else if (sortBy === "quality") {
      filtered.sort((a, b) => (b.intelligenceIndex || 0) - (a.intelligenceIndex || 0));
    } else if (sortBy === "speed") {
      filtered.sort((a, b) => (b.speed || 0) - (a.speed || 0));
    }

    setFilteredData(filtered);
  }, [selectedModels, models, fetcher.data, sortBy]);

  const handleModelToggle = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName)
        ? prev.filter((name) => name !== modelName)
        : [...prev, modelName]
    );
  };

  const handleSelectAll = () => {
    const currentModels = fetcher.data?.models || models;
    // Select all currently displayed models (respecting filters and search)
    setSelectedModels(prev => {
      const newSelection = new Set([...prev, ...displayedModelsList.map(m => m.name)]);
      return Array.from(newSelection);
    });
  };

  const handleDeselectAll = () => {
    // Deselect only currently displayed models
    const displayedNames = displayedModelsList.map(m => m.name);
    setSelectedModels(prev => prev.filter(name => !displayedNames.includes(name)));
  };

  const currentModels = fetcher.data?.models || models;
  const currentError = fetcher.data?.error || error;
  const currentLastUpdated = fetcher.data?.lastUpdated || lastUpdated;

  // Get unique providers for filter
  const providers = Array.from(new Set(currentModels.map(m => m.creator).filter(Boolean))).sort();

  // Filter models list based on provider filter AND search query
  const displayedModelsList = currentModels.filter(m => {
    const matchesProvider = providerFilter === "all" || m.creator === providerFilter;
    const matchesSearch = searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.creator && m.creator.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProvider && matchesSearch;
  });

  const lowPriceModels = currentModels.filter((item) => item.Input < 1).map((item) => item.name);
  const midPriceModels = currentModels.filter((item) => item.Input >= 1 && item.Input < 10).map((item) => item.name);
  const highPriceModels = currentModels.filter((item) => item.Input >= 10).map((item) => item.name);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "low":
        setSelectedModels(lowPriceModels);
        break;
      case "mid":
        setSelectedModels(midPriceModels);
        break;
      case "high":
        setSelectedModels(highPriceModels);
        break;
      case "all":
      default:
        // Reset to default selection logic or all? Let's do all for explicit "All" click
        setSelectedModels(currentModels.map((item) => item.name));
        break;
    }
  };

  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value);
  };

  const chartData = filteredData.map((item) => ({
    name: item.name,
    Input: item.Input,
    Output: item.Output,
    speed: item.speed,
    intelligence: item.intelligenceIndex
  }));

  const inputColor = "#818cf8";
  const outputColor = "#22d3ee";

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; color: string; value: number; payload: any }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-xl bg-gray-900/90 text-white border border-gray-700 backdrop-blur-sm animate-fade-in z-50">
          <p className="font-bold mb-2 border-b border-gray-700 pb-1">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="font-mono">${entry.value.toFixed(4)}</span>
            </div>
          ))}
          {data.intelligence && (
            <div className="flex items-center justify-between gap-4 mb-1 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
              <span>Intelligence Index:</span>
              <span className="font-mono text-white">{data.intelligence}</span>
            </div>
          )}
          {data.speed && (
            <div className="flex items-center justify-between gap-4 mb-1 text-xs text-gray-400">
              <span>Speed (tok/s):</span>
              <span className="font-mono text-white">{data.speed.toFixed(0)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-20">
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-gray-900/80 border border-pink-500/40 shadow-lg rounded-full text-sm relative overflow-visible group transition-all duration-300 hover:shadow-pink-500/30 hover:border-blue-400/60 hover:scale-105"
        >
          <span className="relative z-10 flex items-center chrome-gradient font-bold">
            ← BACK TO HOME
          </span>
        </Link>
      </div>

      <main className="container mx-auto py-10 pt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold chrome-gradient animate-fade-in-up">AI API Pricing</h1>
            <div className="flex items-center gap-2 mt-1">
              {currentLastUpdated && (
                <span className="text-sm text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Last updated: {new Date(currentLastUpdated).toLocaleDateString()}
                </span>
              )}
              <span className="text-gray-600">|</span>
              <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                Data provided by Artificial Analysis ↗
              </a>
            </div>
          </div>

          <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="quality">Quality (Intelligence)</option>
              <option value="speed">Speed (Tokens/s)</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="all">All Providers</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {currentError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 animate-fade-in">
            <p className="font-semibold">⚠️ {currentError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div style={{ width: `${Math.max(100, chartData.length * 80)}px`, minWidth: '100%', height: '600px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 160 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={140}
                        interval={0}
                        tick={{ fill: "#e5e7eb", fontSize: 13, fontWeight: 500 }}
                        tickLine={false}
                        tickFormatter={(value) => value.length > 35 ? `${value.substring(0, 35)}...` : value}
                      />
                      <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: "#9ca3af", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {(displayMode === "both" || displayMode === "input") && (
                        <Bar dataKey="Input" fill={inputColor} name="Input Cost" radius={[4, 4, 0, 0]} animationDuration={1500} />
                      )}
                      {(displayMode === "both" || displayMode === "output") && (
                        <Bar dataKey="Output" fill={outputColor} name="Output Cost" radius={[4, 4, 0, 0]} animationDuration={1500} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="text-center text-gray-500 text-xs mt-2 italic">
                Scroll horizontally to see more models →
              </div>
            </div>

            {/* Quick Select Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <button
                onClick={() => {
                  const smartest = currentModels
                    .sort((a, b) => (b.intelligenceIndex || 0) - (a.intelligenceIndex || 0))
                    .slice(0, 10)
                    .map(m => m.name);
                  setSelectedModels(smartest);
                  setSortBy("quality");
                  setProviderFilter("all");
                  setSearchQuery("");
                }}
                className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-xl text-left hover:bg-gray-800/50 hover:border-purple-500/60 transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🧠</div>
                <h3 className="font-bold text-white mb-1">Smartest Models</h3>
                <p className="text-xs text-gray-400">Top 10 models by Intelligence Index</p>
              </button>

              <button
                onClick={() => {
                  const fastest = currentModels
                    .sort((a, b) => (b.speed || 0) - (a.speed || 0))
                    .slice(0, 10)
                    .map(m => m.name);
                  setSelectedModels(fastest);
                  setSortBy("speed");
                  setProviderFilter("all");
                  setSearchQuery("");
                }}
                className="bg-gray-900/50 border border-yellow-500/30 p-4 rounded-xl text-left hover:bg-gray-800/50 hover:border-yellow-500/60 transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">⚡</div>
                <h3 className="font-bold text-white mb-1">Fastest Models</h3>
                <p className="text-xs text-gray-400">Top 10 models by Speed (Tokens/s)</p>
              </button>

              <button
                onClick={() => {
                  const bestValue = currentModels
                    .filter(m => (m.intelligenceIndex || 0) > 50 && m.Input < 1)
                    .sort((a, b) => a.Input - b.Input)
                    .slice(0, 10)
                    .map(m => m.name);
                  setSelectedModels(bestValue);
                  setSortBy("price_low");
                  setProviderFilter("all");
                  setSearchQuery("");
                }}
                className="bg-gray-900/50 border border-green-500/30 p-4 rounded-xl text-left hover:bg-gray-800/50 hover:border-green-500/60 transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">💰</div>
                <h3 className="font-bold text-white mb-1">Best Value</h3>
                <p className="text-xs text-gray-400">High intelligence (&gt;50) & Low price (&lt;$1)</p>
              </button>

              <button
                onClick={() => {
                  const defaultSelection = currentModels
                    .filter(m => LATEST_MODELS.some(latest => m.name.includes(latest)))
                    .map(m => m.name);
                  setSelectedModels(defaultSelection.length > 0 ? defaultSelection : currentModels.slice(0, 15).map(m => m.name));
                  setSortBy("price_low");
                  setProviderFilter("all");
                  setSearchQuery("");
                }}
                className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-xl text-left hover:bg-gray-800/50 hover:border-blue-500/60 transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🆕</div>
                <h3 className="font-bold text-white mb-1">Latest & Greatest</h3>
                <p className="text-xs text-gray-400">Curated list of popular new models</p>
              </button>
            </div>
          </div>
          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800 shadow-xl">
              <h2 className="text-lg font-semibold mb-2 text-gray-200">Price Range</h2>
              <div className="flex gap-2 mb-4">
                <button className={`px-2 py-1 rounded text-sm transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleTabChange('all')}>All</button>
                <button className={`px-2 py-1 rounded text-sm transition-colors ${activeTab === 'low' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleTabChange('low')}>Low</button>
                <button className={`px-2 py-1 rounded text-sm transition-colors ${activeTab === 'mid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleTabChange('mid')}>Mid</button>
                <button className={`px-2 py-1 rounded text-sm transition-colors ${activeTab === 'high' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleTabChange('high')}>High</button>
              </div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">Display</h2>
              <div className="flex gap-2 mb-4">
                <button className={`px-2 py-1 rounded text-sm transition-colors ${displayMode === 'both' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleDisplayModeChange('both')}>Both</button>
                <button className={`px-2 py-1 rounded text-sm transition-colors ${displayMode === 'input' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleDisplayModeChange('input')}>Input</button>
                <button className={`px-2 py-1 rounded text-sm transition-colors ${displayMode === 'output' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} onClick={() => handleDisplayModeChange('output')}>Output</button>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search models or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </div>

              <div className="flex justify-between mb-2">
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={handleSelectAll}>Select All</button>
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={handleDeselectAll}>Deselect All</button>
              </div>
              <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {displayedModelsList.map((model, index) => (
                  <div
                    key={model.name}
                    className="flex items-center space-x-2 mb-1 p-1 rounded hover:bg-gray-800/50 transition-colors animate-fade-in-right"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <input
                      type="checkbox"
                      id={model.name}
                      checked={selectedModels.includes(model.name)}
                      onChange={() => handleModelToggle(model.name)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                    <label htmlFor={model.name} className="text-sm cursor-pointer flex-1 text-gray-300 select-none">
                      {model.name}
                      {model.creator && (
                        <span className="text-xs text-gray-500 ml-2">({model.creator})</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}