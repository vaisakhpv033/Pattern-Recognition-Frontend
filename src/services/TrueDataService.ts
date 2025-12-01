export interface OHLCVData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export const fetchTrueDataHistory = async (symbol: string, interval: string): Promise<OHLCVData[]> => {
    console.log(`Fetching TrueData history for ${symbol} on ${interval} interval`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const data: OHLCVData[] = [];
    let currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 1); // Start 1 year ago

    let currentPrice = 150.0;

    for (let i = 0; i < 365; i++) {
        const volatility = 2.0;
        const change = (Math.random() - 0.5) * volatility;
        const open = currentPrice;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;
        const volume = Math.floor(Math.random() * 1000000) + 500000;

        data.push({
            time: currentDate.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });

        currentPrice = close;
        currentDate.setDate(currentDate.getDate() + 1);

        // Skip weekends
        if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() === 6) currentDate.setDate(currentDate.getDate() + 2);
    }

    return data;
};
