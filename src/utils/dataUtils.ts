import type { OHLCVData } from "../services/TrueDataService";

/**
 * Aggregates daily OHLCV data into weekly OHLCV data.
 * Assumes the input data is sorted by time (ascending).
 * Weeks are considered to start on Monday.
 */
export const aggregateDailyToWeekly = (dailyData: OHLCVData[]): OHLCVData[] => {
    if (!dailyData || dailyData.length === 0) {
        return [];
    }

    const weeklyData: OHLCVData[] = [];
    let currentWeekCandle: OHLCVData | null = null;
    let currentWeekStartTimestamp: number | null = null;

    for (const dayCandle of dailyData) {
        const date = new Date(dayCandle.time * 1000);

        // Calculate the start of the week (Monday)
        // getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const weekStart = new Date(date);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekStartTimestamp = Math.floor(weekStart.getTime() / 1000);

        if (currentWeekStartTimestamp !== weekStartTimestamp) {
            // Push the previous completed week
            if (currentWeekCandle) {
                weeklyData.push(currentWeekCandle);
            }

            // Start a new week
            currentWeekStartTimestamp = weekStartTimestamp;
            currentWeekCandle = {
                time: weekStartTimestamp,
                open: dayCandle.open,
                high: dayCandle.high,
                low: dayCandle.low,
                close: dayCandle.close,
                volume: dayCandle.volume || 0
            };
        } else if (currentWeekCandle) {
            // Update existing week
            currentWeekCandle.high = Math.max(currentWeekCandle.high, dayCandle.high);
            currentWeekCandle.low = Math.min(currentWeekCandle.low, dayCandle.low);
            currentWeekCandle.close = dayCandle.close; // Close is always the last available close
            currentWeekCandle.volume = (currentWeekCandle.volume || 0) + (dayCandle.volume || 0);
        }
    }

    // Push the last week
    if (currentWeekCandle) {
        weeklyData.push(currentWeekCandle);
    }

    return weeklyData;
};
