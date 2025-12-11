import axios from "axios";

// const API_BASE_URL = "http://localhost:8000/api"; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export interface PriceData {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
}

// Extra series point type for EMA/RSC line
export interface SeriesPoint {
    time: number;
    value: number;
}

export interface Marker {
    time: number; // Unix timestamp
    position: "aboveBar" | "belowBar" | "inBar";
    color: string;
    shape: "arrowUp" | "arrowDown" | "circle" | "square";
    text?: string;
    pattern_id?: number; // Used for grouping bowl patterns
    score?: number; // Success score from backend (may be 0/1 in new schema)

    // NRB RANGE-LINE FIELDS (OPTIONAL)
    range_low?: number | null;
    range_high?: number | null;
    range_start_time?: number | null;
    range_end_time?: number | null;
    nrb_id?: number | null;

    // Direction info for arrows
    direction?: "Bullish Break" | "Bearish Break" | string;
}

export interface PatternScanResponse {
    scrip: string;
    pattern: string;
    price_data: PriceData[];
    markers: Marker[];

    // 🆕 parameter series info (for EMA/RSC)
    series?: string | null;
    series_data?: SeriesPoint[];
}


// Function to fetch pattern scan data from your backend
export const fetchPatternScanData = async (
    scrip: string,
    pattern: string,
    nrbLookback: number | null, // kept for backward compatibility, backend ignores it
    successRate: number | null,
    weeks?: number,
    series?: string | null // 🆕 ema21 / ema50 / ema200 / rsc30 / rsc500
): Promise<PatternScanResponse> => {
    try {
        const params: any = {
            scrip,
            pattern,
            success_rate: successRate,
        };

        // backend ignores nrb_lookback, but sending it is safe
        if (nrbLookback !== null) {
            params.nrb_lookback = nrbLookback;
        }

        if (pattern === "Narrow Range Break" && weeks != null) {
            // ?weeks=52 etc.
            params.weeks = weeks;
        }

        if (series) {
            // ?series=ema50 etc.
            params.series = series;
        }

        const response = await axios.get<PatternScanResponse>(
            `${API_BASE_URL}/pattern-scan/`,
            { params }
        );

        console.log("[API] Raw response data:", response.data);
        console.log("[API] Response keys:", Object.keys(response.data));

        // Backward-compatible markers extraction
        let rawMarkers = response.data.markers;
        if (!rawMarkers && (response.data as any).triggers) {
            rawMarkers = (response.data as any).triggers;
            console.log("[API] Found markers in 'triggers' field");
        }
        if (!rawMarkers && Array.isArray(response.data)) {
            rawMarkers = response.data as any;
            console.log("[API] Response is array, treating as markers");
        }

        console.log("[API] Markers found:", rawMarkers);
        console.log("[API] Number of markers:", rawMarkers?.length || 0);

        const normalizedSeries = (response.data as any).series ?? series ?? null;
        const normalizedSeriesData: SeriesPoint[] =
            ((response.data as any).series_data as SeriesPoint[]) ?? [];

        // Normalize markers - ensure they have the required structure
        const normalizedData: PatternScanResponse = {
            scrip: response.data.scrip || scrip,
            pattern: response.data.pattern || pattern,
            price_data: response.data.price_data || [],
            markers: (rawMarkers || []).map((marker: any) => ({
                time: marker.time,
                pattern_id: marker.pattern_id,
                score: marker.score,

                // Optional fields with defaults
                position: (marker.position === "overlay" ? "aboveBar" : marker.position) || "belowBar",
                color: marker.color || "#2196F3",
                shape: marker.shape || "circle",
                text: marker.text,

                // NRB RANGE INFO
                range_low: marker.range_low ?? null,
                range_high: marker.range_high ?? null,
                range_start_time: marker.range_start_time ?? null,
                range_end_time: marker.range_end_time ?? null,
                nrb_id: marker.nrb_id ?? null,
                direction: marker.direction,
            })),

            // 🆕 series / series_data returned to the caller
            series: normalizedSeries,
            series_data: normalizedSeriesData,
        };

        console.log(
            "[API] Normalized markers count:",
            normalizedData.markers.length
        );
        if (normalizedData.markers.length > 0) {
            console.log("[API] Sample normalized marker:", normalizedData.markers[0]);
        }
        console.log(
            "[API] Series:",
            normalizedData.series,
            "Points:",
            normalizedData.series_data?.length ?? 0
        );

        return normalizedData;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error || "An unknown API error occurred"
            );
        }
        console.error("Network or other error:", error);
        throw new Error("Network or other error during API call");
    }
};


export interface Week52HighResponse {
    scrip: string;
    "52week_high": number | null;
    cutoff_date: string;
}

export const fetch52WeekHigh = async (scrip: string): Promise<Week52HighResponse> => {
    try {
        const response = await axios.get<Week52HighResponse>(
            `${API_BASE_URL}/52week-high/`,
            { params: { scrip } }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching 52-week high:", error);
        throw error;
    }
};
