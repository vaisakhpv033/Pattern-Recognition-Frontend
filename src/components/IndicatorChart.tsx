import { createChart, ColorType, LineSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface IndicatorChartProps {
    data: { time: number; value: number }[];
    color?: string;
    height?: number;
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
    };
}

export interface IndicatorChartHandle {
    api: () => IChartApi | null;
}

export const IndicatorChart = forwardRef<IndicatorChartHandle, IndicatorChartProps>(({
    data,
    color = '#2962FF',
    colors = {}
}, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const isFirstLoad = useRef(true);

    const {
        backgroundColor = '#1e222d',
        textColor = '#d1d4dc',
    } = colors;

    useImperativeHandle(ref, () => ({
        api: () => chartRef.current
    }));

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                const { clientWidth, clientHeight } = chartContainerRef.current;
                chartRef.current.applyOptions({ width: clientWidth, height: clientHeight });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight, // Use container height
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
            timeScale: {
                visible: true,
                timeVisible: true,
            }
        });

        chartRef.current = chart;

        const lineSeries = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
        });

        seriesRef.current = lineSeries;

        const chartData = data.map(d => ({
            time: d.time as UTCTimestamp,
            value: d.value
        }));

        lineSeries.setData(chartData);
        chart.timeScale().fitContent();

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [backgroundColor, textColor]);

    // Update data and color
    useEffect(() => {
        if (seriesRef.current) {
            seriesRef.current.applyOptions({ color });

            const chartData = data.map(d => ({
                time: d.time as UTCTimestamp,
                value: d.value
            }));

            seriesRef.current.setData(chartData);

            if (chartRef.current && isFirstLoad.current && data.length > 0) {
                chartRef.current.timeScale().fitContent();
                isFirstLoad.current = false;
            }
        }
    }, [data, color]);

    return (
        <div ref={chartContainerRef} className="w-full h-full" />
    );
});

IndicatorChart.displayName = "IndicatorChart";
