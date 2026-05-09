import { useState } from 'react';
import { Network, Activity, FileJson, AlertTriangle, Play, BrainCircuit, HeartPulse, Stethoscope, TestTubes, Pill, Building, ShieldAlert } from 'lucide-react';
import { runSimulation, SimulationResult, AgentAction } from './lib/gemini';

const AGENTS = [
  { id: 'Intake Agent', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'Diagnostic Agent', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'Emergency Triage Agent', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'Lab MCP Agent', icon: <TestTubes className="w-4 h-4" /> },
  { id: 'Treatment Planning Agent', icon: <Pill className="w-4 h-4" /> },
  { id: 'Hospital Resource Agent', icon: <Building className="w-4 h-4" /> },
  { id: 'Supervisor Agent', icon: <ShieldAlert className="w-4 h-4" /> },
];

export default function App() {
  const [input, setInput] = useState("Patient has chest pain, shortness of breath, sweating, and dizziness");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSimulation = async () => {
    if (!input.trim()) return;
    setIsSimulating(true);
    setResult(null);
    setError(null);
    setActiveAgent('Supervisor Agent');

    try {
      // Small simulated delay for UI feel
      const simTask = runSimulation(input);
      
      const agentsCycle = ['Intake Agent', 'Diagnostic Agent', 'Emergency Triage Agent', 'Lab MCP Agent', 'Treatment Planning Agent', 'Hospital Resource Agent', 'Supervisor Agent'];
      for (let i = 0; i < agentsCycle.length; i++) {
        setActiveAgent(agentsCycle[i]);
        await new Promise(r => setTimeout(r, 600)); // Rotate through agents visually
      }

      const simResult = await simTask;
      setResult(simResult);
    } catch (e: any) {
      setError(e.message || "Simulation failed.");
    } finally {
      setIsSimulating(false);
      setActiveAgent(null);
    }
  };

  return (
    <div className="flex bg-[#E4E3E0] min-h-screen text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar - Agent Network */}
      <aside className="w-64 border-r border-[#141414] flex flex-col bg-[#E4E3E0]">
        <div className="p-4 border-b border-[#141414] flex items-center gap-2">
          <Network className="w-5 h-5" />
          <h1 className="font-bold tracking-tighter leading-none">MEDI-ORCHESTRA<br/><span className="text-xs font-mono font-normal opacity-60 uppercase">System Active</span></h1>
        </div>
        
        <div className="p-4 flex-1">
          <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-4">Agent Network</h2>
          <div className="space-y-1">
            {AGENTS.map((agent) => {
              const isActive = activeAgent === agent.id;
              const hasRun = result && result.agentAnalysisChain.some(a => a.fromAgent.includes(agent.id) || a.toAgent.includes(agent.id));
              
              return (
                <div 
                  key={agent.id}
                  className={`flex items-center gap-3 p-2 text-sm transition-colors ${isActive ? 'bg-[#141414] text-[#E4E3E0]' : hasRun ? 'opacity-100' : 'opacity-60'}`}
                >
                  {agent.icon}
                  <span className="font-mono text-[11px] uppercase truncate">{agent.id}</span>
                  {isActive && <Activity className="w-3 h-3 ml-auto animate-pulse" />}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="border-b border-[#141414] p-4 bg-[#E4E3E0]">
          <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-2">Patient Intake / Input</h2>
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter patient symptoms..."
              className="flex-1 bg-transparent border border-[#141414] p-2 font-mono text-sm focus:outline-none focus:bg-white/50 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && startSimulation()}
            />
            <button 
              onClick={startSimulation}
              disabled={isSimulating}
              className="bg-[#141414] text-[#E4E3E0] px-4 py-2 font-mono uppercase text-xs tracking-wider flex items-center gap-2 hover:bg-black disabled:opacity-50 transition-colors"
            >
              {isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isSimulating ? 'Simulating...' : 'Run Analysis'}
            </button>
          </div>
          {error && <div className="mt-2 text-red-600 font-mono text-xs uppercase">{error}</div>}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-auto bg-white">
          {!result && !isSimulating && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <BrainCircuit className="w-16 h-16 mb-4" />
              <p className="font-mono text-sm uppercase tracking-widest">Awaiting Patient Data</p>
            </div>
          )}

          {isSimulating && !result && (
            <div className="h-full flex flex-col items-center justify-center">
              <Activity className="w-16 h-16 mb-4 animate-pulse" />
              <p className="font-mono text-sm uppercase tracking-widest mb-2">Simulating Neural Network</p>
              <p className="font-mono text-xs opacity-50">{activeAgent} is processing...</p>
            </div>
          )}

          {result && (
            <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
              
              {/* Emergency Alert (Span full if present) */}
              {result.emergencyAlert && (
                <div className="col-span-full border border-red-600 bg-red-50 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                  <h2 className="font-serif italic text-red-600 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Emergency Alert
                  </h2>
                  <p className="font-mono text-red-900 font-bold uppercase text-lg">{result.emergencyAlert}</p>
                </div>
              )}

              {/* Triage & Diagnosis */}
              <div className="col-span-full md:col-span-2 lg:col-span-1 border border-[#141414] p-4 flex flex-col gap-4">
                 <div>
                  <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-1">Triage Level</h2>
                  <div className={`inline-block font-mono font-bold uppercase text-xl px-2 py-1 border ${result.triageLevel === 'ICU' ? 'bg-red-600 text-white border-red-600' : 'bg-[#141414] text-white border-[#141414]'}`}>
                    {result.triageLevel}
                  </div>
                 </div>
                 <div>
                  <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-1">Diagnosis</h2>
                  <p className="font-mono lg:text-lg leading-tight">{result.diagnosis}</p>
                 </div>
                 <div>
                  <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-1">Confidence</h2>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-[#141414] transition-all" style={{width: `${result.confidenceScore}%`}} /></div>
                    <span className="font-mono text-xs">{result.confidenceScore}%</span>
                  </div>
                 </div>
              </div>

              {/* Treatment Plan */}
              <div className="col-span-full md:col-span-2 border border-[#141414] p-4">
                <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-4">Treatment Plan</h2>
                <ul className="space-y-2">
                  {result.treatmentPlan.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-mono text-xs opacity-50 block mt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className="font-mono text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supervisor Decision */}
              <div className="col-span-full lg:col-span-1 border border-[#141414] p-4 bg-[#141414] text-[#E4E3E0]">
                <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-4 text-white hover:opacity-100">Supervisor Decision</h2>
                <p className="font-mono text-sm leading-relaxed text-balance uppercase tracking-wide">{result.supervisorDecision}</p>
              </div>

              {/* A2A Chain */}
              <div className="col-span-full lg:col-span-2 xl:col-span-3 border border-[#141414] p-4">
                <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-4">A2A Analysis Chain</h2>
                <div className="space-y-0">
                  {result.agentAnalysisChain.map((action, idx) => (
                    <div key={idx} className="data-row hover:bg-[#141414] hover:text-[#E4E3E0] grid grid-cols-[30px_1.5fr_1fr_1fr] p-3 border-b border-[#141414]/20 transition-colors cursor-default text-xs items-center gap-4">
                       <span className="font-mono opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                       <div>
                         <div className="font-mono font-bold uppercase">{action.fromAgent} <span className="opacity-50 mx-1">→</span> {action.toAgent}</div>
                         <div className="font-mono opacity-80 mt-1 line-clamp-1">{action.message}</div>
                       </div>
                       <div className="font-mono opacity-70 truncate" title={action.dataSummary}>{action.dataSummary}</div>
                       <div className="font-mono opacity-60 text-right">{action.confidence ? `P=${action.confidence}` : '-'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FHIR JSON */}
              <div className="col-span-full lg:col-span-2 xl:col-span-1 border border-[#141414] p-4 bg-gray-50 flex flex-col">
                <h2 className="font-serif italic text-xs uppercase tracking-widest opacity-50 mb-2 flex items-center gap-2">
                  <FileJson className="w-3 h-3" /> FHIR Summary
                </h2>
                <div className="flex-1 overflow-auto max-h-[300px]">
                  <pre className="font-mono text-[10px] text-[#141414] opacity-80 whitespace-pre-wrap">
                    {JSON.stringify(result.patientSummary, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}

