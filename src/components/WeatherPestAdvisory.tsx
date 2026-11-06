import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plane,
  Volume2,
  RefreshCw,
  LocateFixed
} from 'lucide-react';
import { Language, RegionalWeatherReport, PestDiseaseAlert } from '../types';
import { REGIONAL_WEATHER_DATA, PEST_DISEASE_ALERTS } from '../data/moduleData';
import { speechService } from '../services/speechService';

interface WeatherPestAdvisoryProps {
  language: Language;
  onNavigateToCompatibility?: () => void;
  onNavigateToDrone?: () => void;
  filterCrop?: string;
}

export const WeatherPestAdvisory: React.FC<WeatherPestAdvisoryProps> = ({
  language,
  onNavigateToCompatibility,
  onNavigateToDrone,
  filterCrop
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Yavatmal');
  const [selectedCrop, setSelectedCrop] = useState<string>(filterCrop || 'All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const weather: RegionalWeatherReport =
    REGIONAL_WEATHER_DATA[selectedDistrict] || REGIONAL_WEATHER_DATA['Yavatmal'];

  // Filter alerts by selected crop
  const filteredAlerts = PEST_DISEASE_ALERTS.filter((alert) => {
    if (selectedCrop === 'All') return true;
    return alert.cropName.toLowerCase().includes(selectedCrop.toLowerCase());
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handlePlayAudio = (text: string) => {
    speechService.speak(text, language);
  };

  const districtsList = Object.keys(REGIONAL_WEATHER_DATA);
  const cropsList = ['All', 'Cotton', 'Paddy / Rice', 'Wheat', 'Chilli', 'Soybean', 'Maize'];

  // Helper for spray condition colors
  const getSprayConditionBadge = (cond: 'Optimal' | 'Caution' | 'Unfavorable') => {
    switch (cond) {
      case 'Optimal':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Optimal for Spraying'
        };
      case 'Caution':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Caution: Wind / Humidity Drift'
        };
      case 'Unfavorable':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          label: 'Unfavorable (Rain Washout Risk)'
        };
    }
  };

  const sprayBadge = getSprayConditionBadge(weather.sprayCondition);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
              <CloudSun className="w-4 h-4" />
              <span>Real-Time Agro-Met & ICAR Disease Surveillance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Live Agricultural Weather & Pest Advisory
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 leading-relaxed">
              District-level microclimate data from State Agricultural Universities and automated pest outbreak risk thresholds. Protect your crops with timely, CIBRC-certified interventions.
            </p>
          </div>

          {/* District Selector & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/15">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-200">
              <LocateFixed className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">Station:</span>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-900 text-white font-bold text-sm px-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d} ({REGIONAL_WEATHER_DATA[d].state})
                </option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              title="Refresh radar data"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Source Station Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-emerald-200/80 gap-2">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-amber-300" />
            <span>Nodal Station: <strong>{weather.universityStation}</strong></span>
          </div>
          <div>{weather.updatedAt}</div>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Temperature */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {weather.temperature}°C
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Min: {weather.minTemp}°C | Max: {weather.maxTemp}°C
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Humidity (RH)</span>
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {weather.humidity}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {weather.humidity > 75 ? (
              <span className="text-rose-600 font-semibold">High: Fungal/spore risk</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Normal transpiration</span>
            )}
          </div>
        </div>

        {/* Rainfall Forecast */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rain Chance</span>
            <CloudRain className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {weather.rainfallChance}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Expected: {weather.rainfallMm} mm
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wind & Drift</span>
            <Wind className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {weather.windSpeedKmH} <span className="text-base font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Direction: {weather.windDirection}
          </div>
        </div>

        {/* Spray Suitability Status */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-emerald-950 p-5 rounded-2xl text-white shadow-xs">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Spray Gauge</span>
            <Plane className="w-5 h-5 text-amber-300" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mb-2 bg-white/10 text-white border-white/20">
            <span className={`w-2 h-2 rounded-full ${sprayBadge.dot}`} />
            <span>{weather.sprayCondition}</span>
          </div>
          <p className="text-[11px] text-emerald-100/80 leading-tight">
            {weather.sprayWindowAdvice}
          </p>
        </div>
      </div>

      {/* Active Crop Warning Bar (Red/Yellow/Green Highlights) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Automated Pest & Disease Outbreak Thresholds</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cross-referenced with microclimate temperature & relative humidity in {selectedDistrict} ({weather.agroZone}).
            </p>
          </div>

          {/* Crop Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {cropsList.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCrop === c
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Warning Banners for Active Crops */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-800">No active disease alerts for {selectedCrop}</p>
              <p className="text-xs text-slate-500 mt-1">Atmospheric conditions in {selectedDistrict} are currently unfavorable for pest outbreaks.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isRed = alert.severity === 'red';
              const isYellow = alert.severity === 'yellow';
              const isGreen = alert.severity === 'green';

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border-2 p-5 sm:p-6 transition-all ${
                    isRed
                      ? 'bg-rose-50/70 border-rose-300'
                      : isYellow
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-emerald-50/70 border-emerald-300'
                  }`}
                >
                  {/* Top Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          isRed
                            ? 'bg-rose-600 text-white shadow-xs'
                            : isYellow
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {isRed && <ShieldAlert className="w-3.5 h-3.5" />}
                        {isYellow && <AlertTriangle className="w-3.5 h-3.5" />}
                        {isGreen && <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>
                          {isRed ? 'RED ALERT: OUTBREAK IMMINENT' : isYellow ? 'YELLOW: SCOUT FIELD' : 'GREEN: LOW RISK'}
                        </span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/80 border text-slate-700 text-xs font-bold">
                        {alert.cropName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {alert.lastSurveyDate}
                      </span>
                      <button
                        onClick={() =>
                          handlePlayAudio(
                            `${alert.cropName} alert: ${alert.riskTitle}. ${alert.preventiveAction}`
                          )
                        }
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                        title="Listen to audio advisory"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Microclimate Trigger */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {alert.pestName} <span className="text-xs font-medium italic text-slate-500">({alert.scientificName})</span>
                    </h3>
                    <p className="text-sm font-bold text-slate-800">
                      {alert.riskTitle}
                    </p>
                    <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 text-xs text-slate-700">
                      <strong>Microclimate Trigger:</strong> {alert.triggerConditions}
                    </div>
                  </div>

                  {/* Symptoms & Action */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Symptoms */}
                    <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span>Key Diagnostic Symptoms</span>
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        {alert.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Immediate Preventive Action */}
                    <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Immediate Action & IPM Protocol</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {alert.preventiveAction}
                      </p>
                      {alert.nonChemicalRemedies.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <strong>Non-Chemical IPM:</strong> {alert.nonChemicalRemedies.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CIBRC Registered Chemical Formulations */}
                  {alert.recommendedChemicals.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                        CIBRC Statutory Approved Chemical Interventions (Target Doses):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {alert.recommendedChemicals.map((chem, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                            <div className="font-bold text-slate-900">
                              {chem.tradeName} <span className="font-normal text-slate-600">({chem.chemicalName})</span>
                            </div>
                            <div className="text-emerald-700 font-semibold mt-1">
                              Dosage: {chem.cibrcDose}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Central CIBRC Reg: {chem.cibrcRegNo}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Navigation Buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Verify chemical compatibility before single-tank mixing:
                    </span>
                    <div className="flex items-center gap-2">
                      {onNavigateToCompatibility && (
                        <button
                          onClick={onNavigateToCompatibility}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Tank-Mix Safety Matrix</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onNavigateToDrone && (
                        <button
                          onClick={onNavigateToDrone}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Plane className="w-3.5 h-3.5 text-amber-300" />
                          <span>Book Drone Spraying</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
