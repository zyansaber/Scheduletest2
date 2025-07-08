import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ScheduleTable from './ScheduleTable';
import ScheduleFilters from './ScheduleFilters';
import ScheduleSidebar from './ScheduleSidebar';
import StagesByClassChart from './charts/StagesByClassChart';
import LoadingOverlay from './LoadingOverlay';

// The App component now handles data fetching, so this component receives data as a prop
const ScheduleDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({});
  const [showCharts, setShowCharts] = useState(true);
  const [selectedChartStages, setSelectedChartStages] = useState([]);
  const [isFilteringData, setIsFilteringData] = useState(false);

  // No auto-initialization - let user choose when to select "All"

  // Update filtered data whenever raw data or filters change
  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }
    
    // Show loading state when filtering large datasets
    if (data.length > 100) {
      setIsFilteringData(true);
    }
    
    // Add small delay for loading state to render
    const filterTimeout = setTimeout(() => {
      const newFilteredData = data.filter(item => {
      try {
        // Apply dealer filter
        if (filters.dealer && filters.dealer !== 'all' && item["Dealer"] !== filters.dealer) {
          return false;
        }
      
      // Apply model filter (new)
      if (filters.model && item["Model"] !== filters.model) {
        return false;
      }
      
      // Apply forecast year filter
      if (filters.forecastYear && item["Forecast Production Date"]) {
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3 && dateParts[2] !== filters.forecastYear) {
          return false;
        }
      }
      
      // Apply forecast month filter
      if (filters.forecastYearMonth && item["Forecast Production Date"]) {
        const dateParts = item["Forecast Production Date"].split('/');
        if (dateParts.length >= 3) {
          const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM format
          if (itemYearMonth !== filters.forecastYearMonth) {
            return false;
          }
        }
      }
      
      // All stage filtering removed as requested
      
      // Apply model range filter (renamed from chassisPrefix)
      if (filters.modelRange && item["Chassis"] && !item["Chassis"].startsWith(filters.modelRange)) {
        return false;
      }
      
      // Apply date field filters (removed OrderReceivedDateYearMonth)
      const dateFields = [
        { filter: 'OrderSentToLongtreeYearMonth', field: 'Order Sent to Longtree' },
        { filter: 'PlansSentToDealerYearMonth', field: 'Plans Sent to Dealer' },
        { filter: 'SignedPlansReceivedYearMonth', field: 'Signed Plans Received' }
      ];
      
      for (const { filter, field } of dateFields) {
        if (filters[filter] && item[field]) {
          const dateParts = item[field].split('/');
          if (dateParts.length >= 3) {
            const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM format
            if (itemYearMonth !== filters[filter]) {
              return false;
            }
          }
        }
      }
      
      return true;
      } catch (error) {
        console.error("Error filtering item:", item, error);
        return false;
      }
    });
    
      setFilteredData(newFilteredData);
      setIsFilteringData(false);
    }, 300);
    
    return () => clearTimeout(filterTimeout);
  }, [data, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Handle stage selection from chart
  const handleStageSelection = useCallback((stages) => {
    // Only update filters when we have stages selected
    if (stages && stages.length > 0) {
      setFilters(prev => ({
        ...prev,
        selectedStages: stages,
        allStagesSelected: false
      }));
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 relative">
      <LoadingOverlay isLoading={isFilteringData} message="Updating filters..." />
      {/* Chart toggle button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
        >
          {showCharts ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" />
                <path fillRule="evenodd" d="M16.293 2.293a1 1 0 011.414 1.414l-14 14a1 1 0 01-1.414-1.414l14-14z" />
              </svg>
              Hide Charts
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              Show Charts
            </>
          )}
        </button>
      </div>
      
      {/* Charts section - can be hidden */}
      {showCharts && (
        <>
          {/* Sidebar at the top */}
          <div className="w-full">
            <ScheduleSidebar data={filteredData} />
          </div>
          
          {/* Full-width chart with integrated filters */}
          <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            <StagesByClassChart selectedStages={handleStageSelection} />
          </div>
        </>
      )}
      
      {/* Filters and Table */}
      <div className="w-full">
        <ScheduleFilters data={data} onFilterChange={handleFilterChange} />
        <ScheduleTable data={filteredData} filters={filters} />
      </div>
    </div>
  );
};

export default ScheduleDashboard;