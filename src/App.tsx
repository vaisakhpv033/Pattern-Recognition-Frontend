import { useState } from 'react';
import ChartContainer from './components/ChartContainer';
import PatternForm from './components/PatternForm';
import ResultsPanel from './components/ResultsPanel';
import { analyzePattern, type PatternData, type AnalysisResult } from './services/mockBackend';
import { ScrollArea } from './components/ui/scroll-area';

function App() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (data: PatternData) => {
    setIsLoading(true);
    try {
      const result = await analyzePattern(data);
      setResults(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg px-2  py-3 flex flex-col gap-6">
      <header className="flex justify-between items-center  ">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
          Pattern Recognition Tool
        </h1>
        
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[85vh]">
          <ChartContainer />
        </div>

          <ScrollArea className="h-full lg:h-[85vh]">
        <div className="flex flex-col gap-6">
          <PatternForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          <ResultsPanel results={results} />
        </div>
          </ScrollArea>
      </main>
      <div className="fixed bottom-2 right-2 text-slate-400 text-sm">v0.0.2</div>
    </div>
  );
}

export default App;
