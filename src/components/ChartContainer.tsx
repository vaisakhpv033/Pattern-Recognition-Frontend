import { useEffect, useState, type FC } from 'react';
import { LightweightChart } from './LightweightChart';
import { fetchTrueDataHistory, type OHLCVData } from '../services/TrueDataService';

const ChartContainer: FC = () => {
    const [data, setData] = useState<OHLCVData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const history = await fetchTrueDataHistory('NIFTY 50', 'D');
                setData(history);
            } catch (error) {
                console.error("Failed to load chart data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="h-full w-full bg-dark-card rounded-lg shadow-lg overflow-hidden border border-slate-700 relative">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Loading Chart Data...
                </div>
            ) : (
                <LightweightChart data={data} />
            )}
        </div>
    );
};

export default ChartContainer;
