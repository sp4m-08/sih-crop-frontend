import { useState, useEffect } from "react";
import { Thermometer, Droplets, Sprout, CloudRain, Wind, RefreshCw, Activity } from "lucide-react";

interface SensorData {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  rainfall_mm: number;
  gas_level: number;
  timestamp: string;
}

const Sensors = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24,
    humidity: 68,
    soil_moisture: 520,
    rainfall_mm: 1.5,
    gas_level: 140,
    timestamp: new Date().toISOString(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time sensor data updates
  const generateRandomData = (): SensorData => {
    return {
      temperature: Math.round((24 + (Math.random() * 4 - 2)) * 100) / 100,
      humidity: Math.round((68 + (Math.random() * 10 - 5)) * 10) / 10,
      soil_moisture: Math.round(520 + (Math.random() * 160 - 80)),
      rainfall_mm: Math.max(0, Math.round((Math.random() * 3.2 - 0.2) * 100) / 100),
      gas_level: 140,
      timestamp: new Date().toISOString(),
    };
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(generateRandomData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSensorData(generateRandomData());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 20) return { status: "Cold", color: "text-blue-600", bg: "bg-blue-50" };
    if (temp < 26) return { status: "Optimal", color: "text-green-600", bg: "bg-green-50" };
    return { status: "Hot", color: "text-red-600", bg: "bg-red-50" };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 60) return { status: "Low", color: "text-orange-600", bg: "bg-orange-50" };
    if (humidity < 75) return { status: "Optimal", color: "text-green-600", bg: "bg-green-50" };
    return { status: "High", color: "text-blue-600", bg: "bg-blue-50" };
  };

  const getSoilMoistureStatus = (moisture: number) => {
    if (moisture < 450) return { status: "Dry", color: "text-red-600", bg: "bg-red-50" };
    if (moisture < 600) return { status: "Good", color: "text-green-600", bg: "bg-green-50" };
    return { status: "Wet", color: "text-blue-600", bg: "bg-blue-50" };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const tempStatus = getTemperatureStatus(sensorData.temperature);
  const humidityStatus = getHumidityStatus(sensorData.humidity);
  const soilStatus = getSoilMoistureStatus(sensorData.soil_moisture);

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Activity className="text-green-600" size={36} />
              Farm Sensors Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Real-time monitoring of your farm conditions</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">
            Last Updated: <span className="font-semibold text-gray-800">{formatTimestamp(sensorData.timestamp)}</span>
          </p>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Temperature Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Thermometer className="text-orange-600" size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tempStatus.bg} ${tempStatus.color}`}>
                {tempStatus.status}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Temperature</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{sensorData.temperature}</span>
              <span className="text-2xl text-gray-500 mb-1">°C</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400 transition-all duration-500"
                style={{ width: `${Math.min((sensorData.temperature / 40) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Droplets className="text-blue-600" size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${humidityStatus.bg} ${humidityStatus.color}`}>
                {humidityStatus.status}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Humidity</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{sensorData.humidity}</span>
              <span className="text-2xl text-gray-500 mb-1">%</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(sensorData.humidity, 100)}%` }}
              />
            </div>
          </div>

          {/* Soil Moisture Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Sprout className="text-amber-600" size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${soilStatus.bg} ${soilStatus.color}`}>
                {soilStatus.status}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Soil Moisture</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{sensorData.soil_moisture}</span>
              <span className="text-xl text-gray-500 mb-1">units</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                style={{ width: `${Math.min((sensorData.soil_moisture / 800) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Rainfall Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-sky-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-100 rounded-full">
                <CloudRain className="text-sky-600" size={28} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600">
                {sensorData.rainfall_mm > 0 ? "Active" : "None"}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Rainfall</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{sensorData.rainfall_mm}</span>
              <span className="text-xl text-gray-500 mb-1">mm</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                style={{ width: `${Math.min((sensorData.rainfall_mm / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Gas Level Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Wind className="text-purple-600" size={28} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                Normal
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Gas Level</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{sensorData.gas_level}</span>
              <span className="text-xl text-gray-500 mb-1">ppm</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min((sensorData.gas_level / 200) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Status Summary Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Activity className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-100">All Sensors</span>
                <span className="font-semibold">Online ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Data Quality</span>
                <span className="font-semibold">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Auto-Refresh</span>
                <span className="font-semibold">5s</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white border-opacity-20">
              <p className="text-sm text-green-100">
                All systems operating normally. Monitoring active.
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            About Your Sensors
          </h3>
          <p className="text-sm text-gray-700">
            Your IoT sensors are continuously monitoring environmental conditions to help optimize crop growth. 
            Data is automatically updated every 5 seconds. Use the refresh button to manually update readings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sensors;