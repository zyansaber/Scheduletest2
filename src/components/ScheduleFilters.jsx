import React, { useState, useEffect } from 'react';

const ScheduleFilters = ({ data, onFilterChange }) => {
  const uniqueModels = React.useMemo(() => {
    if (!data) return [];
    const models = new Set();
    data.forEach(item => {
      if (item["Model"]) models.add(item["Model"]);
    });
    return ['', ...Array.from(models).sort()];
  }, [data]);

  const uniqueModelYears = React.useMemo(() => {
    if (!data) return [];
    const years = new Set();
    data.forEach(item => {
      if (item["Model Year"]) years.add(item["Model Year"]);
    });
    return ['', ...Array.from(years).sort()];
  }, [data]);

  const uniqueDealers = React.useMemo(() => {
    if (!data) return [];
    const dealers = new Set();
    data.forEach(item => {
      if (item["Dealer"]) dealers.add(item["Dealer"]);
    });
    return ['all', ...Array.from(dealers).sort()];
  }, [data]);

  const regentProductionStages = React.useMemo(() => {
    if (!data) return [];
    const stages = new Set();
    const seaFreightingStages = [];
    
    data.forEach(item => {
      if (item["Regent Production"]) {
        const stage = item["Regent Production"];
        if (stage.toLowerCase() === "finished") return;
        if (stage.includes('-')) {
          seaFreightingStages.push(stage);
          stages.add("Sea Freighting");
        } else {
          stages.add(stage);
        }
      }
    });
    
    return Array.from(stages).sort();
  }, [data]);

  const [filters, setFilters] = useState({
    dealer: '',
    forecastYear: '',
    forecastYearMonth: '',
    selectedStages: [],
    modelRange: '',
    model: '',
    modelYear: '',
    OrderSentToLongtreeYearMonth: '',
    PlansSentToDealerYearMonth: '',
    SignedPlansReceivedYearMonth: '',
    allStagesSelected: true
  });

  useEffect(() => {
    if (regentProductionStages.length > 0 && filters.selectedStages.length === 0) {
      setFilters(prev => ({
        ...prev,
        selectedStages: [...regentProductionStages],
        allStagesSelected: true
      }));
    }
  }, [regentProductionStages]);

  const forecastYears = React.useMemo(() => {
    if (!data) return [];
    const years = new Set();
    data.forEach(item => {
      if (item["Forecast Production Date"]) {
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3) years.add(dateParts[2]);
      }
    });
    return ['', ...Array.from(years).filter(year => year !== "2024").sort()];
  }, [data]);

  const forecastMonths = React.useMemo(() => {
    if (!data || !filters.forecastYear) return [];
    const months = new Set();
    data.forEach(item => {
      if (item["Forecast Production Date"]) {
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3 && dateParts[2] === filters.forecastYear) {
          const yearMonth = `${dateParts[2]}-${dateParts[1]}`;
          months.add(yearMonth);
        }
      }
    });
    return ['', ...Array.from(months).sort()];
  }, [data, filters.forecastYear]);

  const modelRanges = React.useMemo(() => {
    if (!data) return [];
    const prefixes = new Set();
    data.forEach(item => {
      if (item["Chassis"] && item["Chassis"].length >= 3) {
        prefixes.add(item["Chassis"].substring(0, 3));
      }
    });
    return ['', ...Array.from(prefixes).sort()];
  }, [data]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'forecastYear' && value !== filters.forecastYear) {
      setFilters(prev => ({
        ...prev,
        [filterName]: value,
        forecastYearMonth: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }
  };

  const handleStageChange = (stage) => {
    setFilters(prev => {
      if (stage === "all") {
        const newAllStagesSelected = !prev.allStagesSelected;
        return {
          ...prev,
          selectedStages: newAllStagesSelected ? [...regentProductionStages] : [],
          allStagesSelected: newAllStagesSelected
        };
      }
      const updatedStages = prev.selectedStages.includes(stage)
        ? prev.selectedStages.filter(s => s !== stage)
        : [...prev.selectedStages, stage];
      const newAllStagesSelected = updatedStages.length === regentProductionStages.length &&
        regentProductionStages.every(s => updatedStages.includes(s));
      return {
        ...prev,
        selectedStages: updatedStages,
        allStagesSelected: newAllStagesSelected
      };
    });
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 text-base" style={{ zoom: '125%' }}>
      <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
          <select className="w-full rounded-md border py-2 px-3" value={filters.dealer}
            onChange={(e) => handleFilterChange('dealer', e.target.value)}>
            <option value="">All Dealers</option>
            {uniqueDealers.map(dealer => dealer !== 'all' && <option key={dealer} value={dealer}>{dealer}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select className="w-full rounded-md border py-2 px-3" value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}>
            <option value="">All Models</option>
            {uniqueModels.map(model => model && <option key={model} value={model}>{model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Year</label>
          <select className="w-full rounded-md border py-2 px-3" value={filters.modelYear}
            onChange={(e) => handleFilterChange('modelYear', e.target.value)}>
            <option value="">All Years</option>
            {uniqueModelYears.map(year => year && <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Range</label>
          <select className="w-full rounded-md border py-2 px-3" value={filters.modelRange}
            onChange={(e) => handleFilterChange('modelRange', e.target.value)}>
            {modelRanges.map(range => <option key={range} value={range}>{range || 'All Ranges'}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilters;
