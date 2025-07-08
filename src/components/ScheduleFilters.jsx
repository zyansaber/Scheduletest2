import React, { useState, useEffect } from 'react';

const ScheduleFilters = ({ data, onFilterChange }) => {
  // Extract unique models
  const uniqueModels = React.useMemo(() => {
    if (!data) return [];
    const models = new Set();
    data.forEach(item => {
      if (item["Model"]) models.add(item["Model"]);
    });
    return ['', ...Array.from(models).sort()];
  }, [data]);

  // Extract unique values for filter dropdowns
  const uniqueDealers = React.useMemo(() => {
    if (!data) return [];
    const dealers = new Set();
    data.forEach(item => {
      if (item["Dealer"]) dealers.add(item["Dealer"]);
    });
    return ['all', ...Array.from(dealers).sort()];
  }, [data]);

  // Get all production stages to initialize them as selected
  const regentProductionStages = React.useMemo(() => {
    if (!data) return [];
    const stages = new Set();
    const seaFreightingStages = [];
    
    data.forEach(item => {
      if (item["Regent Production"]) {
        const stage = item["Regent Production"];
        
        // Skip "Finished" stage as requested
        if (stage.toLowerCase() === "finished") {
          return;
        }
        
        // Group stages with '-' as "Sea Freighting"
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

  // Initialize filters with all stages selected
  const [filters, setFilters] = useState({
    dealer: '',
    forecastYear: '',
    forecastYearMonth: '',
    selectedStages: [], // Will be populated in useEffect
    modelRange: '', // Renamed from chassisPrefix
    model: '', // New filter for model
    // Removed OrderReceivedDateYearMonth as requested
    OrderSentToLongtreeYearMonth: '',
    PlansSentToDealerYearMonth: '',
    SignedPlansReceivedYearMonth: '',
    allStagesSelected: true // New state to track if "All" option is selected
  });

  // Set all production stages selected on initial load
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
        // Extract year from DD/MM/YYYY format
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3) {
          years.add(dateParts[2]); // Year is in position 2
        }
      }
    });
    return ['', ...Array.from(years).filter(year => year !== "2024").sort()];
  }, [data]);

  const forecastMonths = React.useMemo(() => {
    if (!data || !filters.forecastYear) return [];
    const months = new Set();
    data.forEach(item => {
      if (item["Forecast Production Date"]) {
        // Extract year and month from DD/MM/YYYY format
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3 && dateParts[2] === filters.forecastYear) {
          const yearMonth = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM format
          months.add(yearMonth);
        }
      }
    });
    return ['', ...Array.from(months).sort()];
  }, [data, filters.forecastYear]);

  // Renamed from chassisPrefixes to modelRanges
  const modelRanges = React.useMemo(() => {
    if (!data) return [];
    const prefixes = new Set();
    data.forEach(item => {
      if (item["Chassis"] && item["Chassis"].length >= 3) {
        const prefix = item["Chassis"].substring(0, 3);
        prefixes.add(prefix);
      }
    });
    return ['', ...Array.from(prefixes).sort()];
  }, [data]);

  const getDateYearMonths = (fieldName) => {
    if (!data) return [];
    const yearMonths = new Set();
    data.forEach(item => {
      // Convert fieldName from camelCase to spaced format
      const formattedFieldName = fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
        
      if (item[formattedFieldName]) {
        // Extract year and month from DD/MM/YYYY format
        const dateParts = item[formattedFieldName].split('/');
        if (dateParts.length >= 3) {
          const yearMonth = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM format
          yearMonths.add(yearMonth);
        }
      }
    });
    return ['', ...Array.from(yearMonths).sort()];
  };

  const handleFilterChange = (filterName, value) => {
    // Special case for forecastYear, reset forecastYearMonth if year changes
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

  // Handle stage checkbox changes
  const handleStageChange = (stage) => {
    setFilters(prev => {
      // Handle "All" option specially
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
      
      // Update allStagesSelected based on if all individual stages are selected
      const newAllStagesSelected = updatedStages.length === regentProductionStages.length && 
        regentProductionStages.every(s => updatedStages.includes(s));
      
      return {
        ...prev,
        selectedStages: updatedStages,
        allStagesSelected: newAllStagesSelected
      };
    });
  };

  // Pass filters up to parent whenever they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Month name formatter
  const getMonthName = (monthNum) => {
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[parseInt(monthNum, 10)];
  };

  // Format year-month for display
  const formatYearMonth = (yearMonth) => {
    if (!yearMonth) return 'All Months';
    const [year, month] = yearMonth.split('-');
    return `${getMonthName(month)} ${year}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 text-base" style={{ zoom: '125%' }}>
      <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dealer Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.dealer}
            onChange={(e) => handleFilterChange('dealer', e.target.value)}
          >
            <option value="">All Dealers</option>
            {uniqueDealers.map(dealer => (
              dealer !== 'all' && <option key={dealer} value={dealer}>{dealer}</option>
            ))}
          </select>
        </div>

        {/* Model Filter - NEW */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
          >
            <option value="">All Models</option>
            {uniqueModels.map(model => (
              model && <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Forecast Production Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Year</label>
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.forecastYear}
            onChange={(e) => handleFilterChange('forecastYear', e.target.value)}
          >
            {forecastYears.map(year => (
              <option key={year} value={year}>{year || 'All Years'}</option>
            ))}
          </select>
        </div>

        {/* Forecast Production Month Filter (dependent on Year) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Month</label>
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.forecastYearMonth}
            onChange={(e) => handleFilterChange('forecastYearMonth', e.target.value)}
            disabled={!filters.forecastYear}
          >
            {forecastMonths.map(month => (
              <option key={month} value={month}>
                {formatYearMonth(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Model Range Filter (renamed from Chassis Prefix) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Range</label>
          <select
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.modelRange}
            onChange={(e) => handleFilterChange('modelRange', e.target.value)}
          >
            {modelRanges.map(range => (
              <option key={range} value={range}>{range || 'All Ranges'}</option>
            ))}
          </select>
        </div>
      </div>



      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setFilters({
            dealer: '',
            forecastYear: '',
            forecastYearMonth: '',
            selectedStages: [...regentProductionStages], // Reset to all stages selected
            modelRange: '',
            model: '',
            // Removed OrderReceivedDateYearMonth
            OrderSentToLongtreeYearMonth: '',
            PlansSentToDealerYearMonth: '',
            SignedPlansReceivedYearMonth: '',
            allStagesSelected: true // Reset to all stages selected
          })}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ScheduleFilters;