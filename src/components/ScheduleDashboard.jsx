
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ScheduleTable from './ScheduleTable';
import ScheduleFilters from './ScheduleFilters';
import ScheduleSidebar from './ScheduleSidebar';
import StagesByClassChart from './charts/StagesByClassChart';
import LoadingOverlay from './LoadingOverlay';
import ForecastYearBreakdown from './charts/ForecastYearBreakdown';

const ScheduleDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({});
  const [showCharts, setShowCharts] = useState(true);
  const [selectedChartStages, setSelectedChartStages] = useState([]);
  const [isFilteringData, setIsFilteringData] = useState(false);

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    if (data.length > 100) setIsFilteringData(true);

    const filterTimeout = setTimeout(() => {
      const newFilteredData = data.filter(item => {
        try {
          if (filters.dealer && filters.dealer !== 'all' && item["Dealer"] !== filters.dealer) return false;
          if (filters.model && item["Model"] !== filters.model) return false;
          if (filters.forecastYear && item["Forecast Production Date"]) {
            const dateParts = item["Forecast Production Date"].split('/');
            if (dateParts.length >= 3 && dateParts[2] !== filters.forecastYear) return false;
          }
          if (filters.forecastYearMonth && item["Forecast Production Date"]) {
            const dateParts = item["Forecast Production Date"].split('/');
            if (dateParts.length >= 3) {
              const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`;
              if (itemYearMonth !== filters.forecastYearMonth) return false;
            }
          }
          if (filters.modelRange && item["Chassis"] && !item["Chassis"].startsWith(filters.modelRange)) return false;
          const dateFields = [
            { filter: 'OrderSentToLongtreeYearMonth', field: 'Order Sent to Longtree' },
            { filter: 'PlansSentToDealerYearMonth', field: 'Plans Sent to Dealer' },
            { filter: 'SignedPlansReceivedYearMonth', field: 'Signed Plans Received' }
          ];
          for (const { filter, field } of dateFields) {
            if (filters[filter] && item[field]) {
              const dateParts = item[field].split('/');
              if (dateParts.length >= 3) {
                const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`;
                if (itemYearMonth !== filters[filter]) return false;
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

  const handleStageSelection = useCallback((stages) => {
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
      <div className="flex justify-end">
        <button 
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
        >
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>
      </div>

      {showCharts && (
        <>
          <div className="w-full">
            <ScheduleSidebar data={filteredData} />
          </div>
          <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            <ForecastYearBreakdown data={filteredData} />
          </div>
          <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            <StagesByClassChart selectedStages={handleStageSelection} />
          </div>
        </>
      )}

      <div className="w-full">
        <ScheduleFilters data={data} onFilterChange={handleFilterChange} />
        <ScheduleTable data={filteredData} filters={filters} />
      </div>
    </div>
  );
};

export default ScheduleDashboard;
