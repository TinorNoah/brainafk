import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
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
  Name: string;
  Input: string;
  Output: string;
}

export default function BargraphPage() {
  const [data, setData] = useState<ModelData[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ModelData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [displayMode, setDisplayMode] = useState<string>("both");

  useEffect(() => {
    const parsedData = (parseCsv(csvData) as Record<string, string>[]).map(
      (item) => ({
        Name: item.Name,
        Input: item.Input,
        Output: item.Output,
      })
    );
    setData(parsedData);
    setSelectedModels(parsedData.map((item) => item.Name));
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => selectedModels.includes(item.Name));
    setFilteredData(filtered);
  }, [selectedModels, data]);

  const handleModelToggle = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName)
        ? prev.filter((name) => name !== modelName)
        : [...prev, modelName]
    );
  };

  const handleSelectAll = () => {
    setSelectedModels(data.map((item) => item.Name));
  };

  const handleDeselectAll = () => {
    setSelectedModels([]);
  };

  const formatDollar = (value: string) => Number.parseFloat(value.replace("$", ""));

  const lowPriceModels = data.filter((item) => formatDollar(item.Input) < 1).map((item) => item.Name);
  const midPriceModels = data.filter((item) => formatDollar(item.Input) >= 1 && formatDollar(item.Input) < 10).map((item) => item.Name);
  const highPriceModels = data.filter((item) => formatDollar(item.Input) >= 10).map((item) => item.Name);

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
        setSelectedModels(data.map((item) => item.Name));
        break;
    }
  };

  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value);
  };

  const chartData = filteredData.map((item) => ({
    name: item.Name,
    Input: formatDollar(item.Input),
    Output: formatDollar(item.Output),
  }));

  const inputColor = "#818cf8";
  const outputColor = "#22d3ee";

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; color: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded shadow-md bg-gray-800 text-white border border-gray-700">
          <p className="font-medium">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
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
        <h1 className="text-3xl font-bold mb-6 chrome-gradient">AI Model Pricing Bargraph</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fill: "#ffffff" }} />
                <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: "#ffffff" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px", color: "#ffffff" }} />
                {(displayMode === "both" || displayMode === "input") && (
                  <Bar dataKey="Input" fill={inputColor} name="Input Cost" />
                )}
                {(displayMode === "both" || displayMode === "output") && (
                  <Bar dataKey="Output" fill={outputColor} name="Output Cost" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Price Range</h2>
            <div className="flex gap-2 mb-4">
              <button className={`px-2 py-1 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleTabChange('all')}>All</button>
              <button className={`px-2 py-1 rounded ${activeTab === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleTabChange('low')}>Low</button>
              <button className={`px-2 py-1 rounded ${activeTab === 'mid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleTabChange('mid')}>Mid</button>
              <button className={`px-2 py-1 rounded ${activeTab === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleTabChange('high')}>High</button>
            </div>
            <h2 className="text-lg font-semibold mb-2">Display</h2>
            <div className="flex gap-2 mb-4">
              <button className={`px-2 py-1 rounded ${displayMode === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleDisplayModeChange('both')}>Both</button>
              <button className={`px-2 py-1 rounded ${displayMode === 'input' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleDisplayModeChange('input')}>Input</button>
              <button className={`px-2 py-1 rounded ${displayMode === 'output' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`} onClick={() => handleDisplayModeChange('output')}>Output</button>
            </div>
            <div className="flex justify-between mb-2">
              <button className="text-xs underline" onClick={handleSelectAll}>Select All</button>
              <button className="text-xs underline" onClick={handleDeselectAll}>Deselect All</button>
            </div>
            <div className="h-[300px] overflow-y-auto pr-2">
              {data.map((model) => (
                <div key={model.Name} className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    id={model.Name}
                    checked={selectedModels.includes(model.Name)}
                    onChange={() => handleModelToggle(model.Name)}
                  />
                  <label htmlFor={model.Name} className="text-sm cursor-pointer">{model.Name}</label>
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
