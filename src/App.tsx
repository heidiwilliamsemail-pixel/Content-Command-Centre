/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Database, 
  BookOpen, 
  Settings as SettingsIcon,
  Plus,
  Mic,
  Send,
  ChevronRight,
  Copy,
  RefreshCw,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  Lightbulb,
  Target,
  Layers,
  FileText,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  Signal, Idea, Angle, ContentAsset, ProofItem, Framework, 
  ProblemType, BuyerType, ContextType, ContentStatus 
} from './types';
import { geminiService } from './services/geminiService';

// --- Mock Data ---
const INITIAL_SIGNALS: Signal[] = [
  { id: '1', content: 'Clients keep asking for "more leads" but their offer is actually the problem. They are selling a commodity in a crowded market.', type: 'text', tags: { problem: 'Strategic', buyer: 'Scaling', context: 'Client' }, createdAt: Date.now() - 86400000 },
  { id: '2', content: 'Voice note: Thinking about the difference between "efficiency" and "effectiveness" in content. Most people optimize for speed but lose the soul.', type: 'voice', tags: { problem: 'Psychological', buyer: 'Solo', context: 'Observation' }, createdAt: Date.now() - 172800000 },
];

const INITIAL_FRAMEWORKS: Framework[] = [
  { id: '1', name: 'Diagnosis → Reframe → Shift', whenToUse: 'Challenging a common industry belief', structure: '1. Identify the symptom. 2. Reframe the cause. 3. Show the new path.', example: 'You think you need more ads (Symptom). Actually, your message is weak (Reframe). Fix the message, and ads become optional (Shift).' },
  { id: '2', name: 'Problem → Why → What doesn’t work → What does', whenToUse: 'Educational/Authority building', structure: '1. State problem. 2. Explain why it exists. 3. List failed solutions. 4. Present your solution.', example: 'Low engagement? It is because you are boring. Standard tips fail. Here is how to be interesting...' },
];

const INITIAL_ANGLES: Angle[] = [
  { id: '1', problem: 'Weak Positioning', buyerType: 'Scaling', momentOfFriction: 'Sales calls feel like a grind', contentAngle: 'The "Commodity Trap" in B2B SaaS' },
];

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6", className)}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline'; className?: string; disabled?: boolean }) => {
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800",
    secondary: "bg-[#00FF00] text-black hover:bg-[#00DD00]",
    outline: "bg-white text-black border border-black hover:bg-zinc-100"
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick} 
      className={cn("px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], className)}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'zinc' }: { children: React.ReactNode; color?: 'zinc' | 'green' | 'blue' | 'orange' }) => {
  const colors = {
    zinc: "bg-zinc-100 text-zinc-800 border-zinc-300",
    green: "bg-green-100 text-green-800 border-green-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
  };
  return (
    <span className={cn("px-2 py-0.5 text-[10px] font-mono uppercase border", colors[color])}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [engineTab, setEngineTab] = useState('signals');
  
  // State
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [angles, setAngles] = useState<Angle[]>(INITIAL_ANGLES);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [frameworks] = useState<Framework[]>(INITIAL_FRAMEWORKS);
  
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isDistilling, setIsDistilling] = useState(false);
  const [isMultiplying, setIsMultiplying] = useState(false);
  const [quickCapture, setQuickCapture] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and add mock signal
      const newSignal: Signal = {
        id: Math.random().toString(36).substr(2, 9),
        content: "Voice note captured: Thinking about buyer psychology and the 'Moment of Friction' in high-ticket sales.",
        type: 'voice',
        tags: { context: 'Idea' },
        createdAt: Date.now()
      };
      setSignals([newSignal, ...signals]);
    }
    setIsRecording(!isRecording);
  };

  const handleQuickCapture = () => {
    if (!quickCapture.trim()) return;
    const newSignal: Signal = {
      id: Math.random().toString(36).substr(2, 9),
      content: quickCapture,
      type: 'text',
      tags: {},
      createdAt: Date.now()
    };
    setSignals([newSignal, ...signals]);
    setQuickCapture('');
  };

  const handleDistill = async (signal: Signal) => {
    setIsDistilling(true);
    try {
      const distilled = await geminiService.distillSignal(signal.content);
      const newIdea: Idea = {
        id: Math.random().toString(36).substr(2, 9),
        signalId: signal.id,
        coreIdea: distilled.coreIdea || '',
        beliefChallenged: distilled.beliefChallenged || '',
        underlyingProblem: distilled.underlyingProblem || '',
        targetBuyer: distilled.targetBuyer || '',
        reallyAbout: distilled.reallyAbout || '',
        whyMatters: distilled.whyMatters || '',
        wrongApproach: distilled.wrongApproach || '',
        createdAt: Date.now()
      };
      setIdeas([newIdea, ...ideas]);
      setSelectedIdeaId(newIdea.id);
      setEngineTab('lab');
    } catch (error) {
      console.error("Distillation failed", error);
    } finally {
      setIsDistilling(false);
    }
  };

  const handleMultiply = async (idea: Idea) => {
    setIsMultiplying(true);
    try {
      const generated = await geminiService.multiplyContent(idea);
      const newAssets: ContentAsset[] = generated.map(g => ({
        id: Math.random().toString(36).substr(2, 9),
        ideaId: idea.id,
        type: g.type as any,
        content: g.content || '',
        status: 'Draft',
        tags: [],
        createdAt: Date.now()
      }));
      setAssets([...newAssets, ...assets]);
      setEngineTab('multiplication');
    } catch (error) {
      console.error("Multiplication failed", error);
    } finally {
      setIsMultiplying(false);
    }
  };

  const renderHome = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xl uppercase italic">Daily Focus</h2>
            <Badge color="green">Active</Badge>
          </div>
          <ul className="space-y-3">
            {['Refine the "Commodity Trap" angle', 'Draft 3 Authority posts for Scaling buyers', 'Review client feedback for new Signal'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-4 h-4 border border-black group-hover:bg-black transition-colors" />
                <span className="font-mono text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card>
          <h2 className="font-mono text-xl uppercase italic mb-4">Momentum</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>POSTS THIS WEEK</span>
                <span>4/7</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 border border-black">
                <div className="h-full bg-[#00FF00]" style={{ width: '57%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>IDEAS IN PIPELINE</span>
                <span>12</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 border border-black">
                <div className="h-full bg-black" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-mono text-xl uppercase italic mb-4">Active Angles</h2>
          <div className="space-y-3">
            {angles.map(angle => (
              <div key={angle.id} className="p-3 border border-zinc-200 hover:border-black transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-xs font-bold">{angle.contentAngle}</span>
                  <Badge>{angle.buyerType}</Badge>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">{angle.problem}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-50">
          <h2 className="font-mono text-xl uppercase italic mb-4">Quick Capture</h2>
          <div className="space-y-4">
            {isRecording ? (
              <div className="w-full h-32 flex flex-col items-center justify-center bg-black text-[#00FF00] border border-black font-mono">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-lg font-bold">RECORDING</span>
                </div>
                <span className="text-2xl">{formatTime(recordingTime)}</span>
                <p className="text-[10px] mt-2 opacity-70">Capturing raw thinking...</p>
              </div>
            ) : (
              <textarea 
                value={quickCapture}
                onChange={(e) => setQuickCapture(e.target.value)}
                placeholder="Dump your thinking here..."
                className="w-full h-32 p-3 bg-white border border-black font-mono text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            )}
            <div className="flex gap-2">
              <Button 
                disabled={isRecording}
                onClick={handleQuickCapture} 
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Send size={14} /> Capture
              </Button>
              <Button 
                onClick={toggleRecording}
                variant={isRecording ? 'primary' : 'outline'} 
                className={cn("flex items-center justify-center gap-2", isRecording && "bg-red-600 border-red-600 hover:bg-red-700")}
              >
                <Mic size={14} />
                {isRecording && "Stop"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContentEngine = () => (
    <div className="space-y-6">
      <div className="flex border-b border-black overflow-x-auto no-scrollbar">
        {[
          { id: 'signals', label: 'Signal Bank', icon: Zap },
          { id: 'lab', label: 'Idea Lab', icon: Lightbulb },
          { id: 'mapper', label: 'Angle Mapper', icon: Target },
          { id: 'multiplication', label: 'Multiplication', icon: Layers },
          { id: 'library', label: 'Library', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setEngineTab(tab.id)}
            className={cn(
              "px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors",
              engineTab === tab.id ? "bg-black text-white" : "hover:bg-zinc-100"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {engineTab === 'signals' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              {signals.map(signal => (
                <div 
                  key={signal.id} 
                  onClick={() => setSelectedSignalId(signal.id)}
                  className={cn(
                    "p-4 border border-black cursor-pointer transition-all",
                    selectedSignalId === signal.id ? "bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-zinc-50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      {signal.type === 'voice' && <Mic size={12} className="text-blue-500" />}
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {signal.tags.problem && <Badge color="orange">{signal.tags.problem}</Badge>}
                      {signal.tags.buyer && <Badge color="blue">{signal.tags.buyer}</Badge>}
                    </div>
                  </div>
                  <p className="font-mono text-sm line-clamp-3">{signal.content}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Card className="sticky top-6">
                <h3 className="font-mono text-sm font-bold uppercase mb-4">Signal Actions</h3>
                {selectedSignalId ? (
                  <div className="space-y-4">
                    <p className="text-xs font-mono text-zinc-600 italic">
                      "{signals.find(s => s.id === selectedSignalId)?.content.substring(0, 100)}..."
                    </p>
                    <Button 
                      disabled={isDistilling}
                      onClick={() => handleDistill(signals.find(s => s.id === selectedSignalId)!)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isDistilling ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                      Distill into Idea
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-zinc-400">Select a signal to begin distillation.</p>
                )}
              </Card>
            </div>
          </motion.div>
        )}

        {engineTab === 'lab' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-mono text-sm font-bold uppercase">Distilled Ideas</h3>
              <div className="space-y-3">
                {ideas.map(idea => (
                  <div 
                    key={idea.id}
                    onClick={() => setSelectedIdeaId(idea.id)}
                    className={cn(
                      "p-4 border border-black cursor-pointer transition-all",
                      selectedIdeaId === idea.id ? "bg-black text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    <h4 className="font-mono text-sm font-bold">{idea.coreIdea}</h4>
                    <p className={cn("text-[10px] mt-1 font-mono", selectedIdeaId === idea.id ? "text-zinc-400" : "text-zinc-500")}>
                      Target: {idea.targetBuyer}
                    </p>
                  </div>
                ))}
                {ideas.length === 0 && <p className="text-xs font-mono text-zinc-400">No ideas distilled yet. Go to Signal Bank.</p>}
              </div>
            </div>

            <div className="lg:col-span-8">
              {selectedIdeaId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-zinc-50 border-dashed">
                    <h4 className="font-mono text-[10px] uppercase text-zinc-400 mb-4">Raw Signal Context</h4>
                    <p className="font-mono text-sm italic text-zinc-600">
                      "{signals.find(s => s.id === ideas.find(i => i.id === selectedIdeaId)?.signalId)?.content}"
                    </p>
                  </Card>
                  
                  <Card className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-mono text-lg uppercase italic">Idea Lab Breakdown</h3>
                      <Button 
                        disabled={isMultiplying}
                        onClick={() => handleMultiply(ideas.find(i => i.id === selectedIdeaId)!)}
                        variant="secondary" 
                        className="text-xs"
                      >
                        {isMultiplying ? <RefreshCw size={12} className="animate-spin" /> : <Layers size={12} />}
                        Multiply
                      </Button>
                    </div>
                    
                    {[
                      { label: 'Core Idea', value: ideas.find(i => i.id === selectedIdeaId)?.coreIdea },
                      { label: 'Belief Challenged', value: ideas.find(i => i.id === selectedIdeaId)?.beliefChallenged },
                      { label: 'Underlying Problem', value: ideas.find(i => i.id === selectedIdeaId)?.underlyingProblem },
                      { label: 'What it is really about', value: ideas.find(i => i.id === selectedIdeaId)?.reallyAbout },
                      { label: 'What most people get wrong', value: ideas.find(i => i.id === selectedIdeaId)?.wrongApproach },
                    ].map((field, i) => (
                      <div key={i} className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-400">{field.label}</label>
                        <p className="text-sm font-mono border-b border-zinc-100 pb-2">{field.value}</p>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Target size={14} /> Refine into Content Angle
                    </Button>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-300 p-12 bg-white/50">
                  <div className="text-center space-y-2">
                    <Lightbulb size={32} className="mx-auto text-zinc-300" />
                    <p className="text-xs font-mono text-zinc-400">Select an idea from the left to begin distillation.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {engineTab === 'multiplication' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-mono text-sm font-bold uppercase">Generated Assets</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs">Filter</Button>
                <Button variant="outline" className="text-xs">Export All</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map(asset => (
                <Card key={asset.id} className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <Badge color="blue">{asset.type}</Badge>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-zinc-100"><Copy size={12} /></button>
                      <button className="p-1 hover:bg-zinc-100"><RefreshCw size={12} /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-48 mb-4">
                    <p className="text-xs font-mono whitespace-pre-wrap">{asset.content}</p>
                  </div>
                  <Button variant="outline" className="w-full text-[10px]">Save to Library</Button>
                </Card>
              ))}
              {assets.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-zinc-300">
                  <p className="text-xs font-mono text-zinc-400">No assets generated. Use the Idea Lab to multiply an idea.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {engineTab === 'mapper' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-0 overflow-hidden">
              <table className="w-full font-mono text-xs text-left">
                <thead className="bg-black text-white uppercase italic">
                  <tr>
                    <th className="p-4 border-r border-zinc-800">Problem</th>
                    <th className="p-4 border-r border-zinc-800">Buyer Type</th>
                    <th className="p-4 border-r border-zinc-800">Moment of Friction</th>
                    <th className="p-4">Content Angle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {angles.map(angle => (
                    <tr key={angle.id} className="hover:bg-zinc-50">
                      <td className="p-4 border-r border-zinc-200">{angle.problem}</td>
                      <td className="p-4 border-r border-zinc-200"><Badge>{angle.buyerType}</Badge></td>
                      <td className="p-4 border-r border-zinc-200">{angle.momentOfFriction}</td>
                      <td className="p-4 font-bold">{angle.contentAngle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Button className="flex items-center gap-2">
              <Plus size={14} /> Add Strategic Angle
            </Button>
          </motion.div>
        )}

        {engineTab === 'library' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs flex items-center gap-2"><Filter size={12} /> Problem</Button>
                <Button variant="outline" className="text-xs flex items-center gap-2"><Filter size={12} /> Angle</Button>
                <Button variant="outline" className="text-xs flex items-center gap-2"><Filter size={12} /> Format</Button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" placeholder="Search library..." className="pl-10 pr-4 py-2 border border-black font-mono text-xs w-full md:w-64 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'The Commodity Trap', status: 'Performing', type: 'Authority', date: '2 days ago' },
                { title: 'Why Efficiency Kills Soul', status: 'Posted', type: 'Contrarian', date: '5 days ago' },
                { title: 'Scaling Beyond Solo', status: 'Draft', type: 'Story', date: '1 week ago' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white border border-black flex items-center justify-between group hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-100 border border-black flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm font-bold">{item.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-mono text-zinc-400">{item.date}</span>
                        <span className="text-[10px] font-mono text-zinc-400">•</span>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge color={item.status === 'Performing' ? 'green' : item.status === 'Posted' ? 'blue' : 'zinc'}>
                      {item.status}
                    </Badge>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderProofBank = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-mono text-2xl uppercase italic">Proof Bank</h2>
        <Button className="flex items-center gap-2"><Plus size={14} /> Add Receipt</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'SaaS Positioning Shift', problem: 'Commodity Messaging', type: 'Result', outcome: '3x increase in demo bookings' },
          { title: 'The "Anti-Hustle" Reframe', problem: 'Burnout Culture', type: 'Story', outcome: 'Viral post with 50+ inbound leads' },
        ].map((proof, i) => (
          <Card key={i}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-mono text-sm font-bold">{proof.title}</h3>
              <Badge color="green">{proof.type}</Badge>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Problem Solved</p>
              <p className="text-xs font-mono">{proof.problem}</p>
            </div>
            <div className="p-3 bg-zinc-50 border border-black">
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Outcome</p>
              <p className="text-xs font-mono font-bold">{proof.outcome}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFrameworks = () => (
    <div className="space-y-6">
      <h2 className="font-mono text-2xl uppercase italic">Framework Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {frameworks.map(fw => (
          <Card key={fw.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-mono text-lg font-bold">{fw.name}</h3>
              <Button variant="outline" className="text-[10px]">Apply</Button>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase">When to use</p>
              <p className="text-xs font-mono">{fw.whenToUse}</p>
            </div>
            <div className="p-4 bg-zinc-50 border-l-4 border-black">
              <p className="text-[10px] font-mono text-zinc-400 uppercase mb-2">Structure</p>
              <p className="text-xs font-mono whitespace-pre-wrap">{fw.structure}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase mb-1">Example</p>
              <p className="text-xs font-mono italic text-zinc-600">"{fw.example}"</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-black font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-64 bg-black text-white flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00FF00] rounded-sm flex items-center justify-center">
            <Zap size={20} className="text-black" />
          </div>
          <span className="hidden md:block font-mono text-lg font-bold tracking-tighter uppercase italic">Signal & Angle</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'engine', label: 'Content Engine', icon: Zap },
            { id: 'proof', label: 'Proof Bank', icon: Quote },
            { id: 'frameworks', label: 'Frameworks', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-sm transition-colors font-mono text-xs uppercase tracking-widest",
                activeTab === item.id ? "bg-[#00FF00] text-black" : "hover:bg-zinc-900 text-zinc-400"
              )}
            >
              <item.icon size={18} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-800">
          <div className="hidden md:block">
            <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Current Focus</p>
            <p className="text-xs font-mono text-[#00FF00]">Scaling Offer v2</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-16 md:pl-64 min-h-screen">
        <header className="h-16 border-b border-black flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <h1 className="font-mono text-sm font-bold uppercase tracking-widest">
            {activeTab === 'home' && 'Command Centre'}
            {activeTab === 'engine' && 'Content Engine'}
            {activeTab === 'proof' && 'Proof Bank'}
            {activeTab === 'frameworks' && 'IP System'}
            {activeTab === 'settings' && 'Configuration'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-black bg-zinc-50">
              <Search size={14} />
              <input type="text" placeholder="Search ideas..." className="bg-transparent font-mono text-xs focus:outline-none" />
            </div>
            <div className="w-8 h-8 border border-black flex items-center justify-center font-mono text-xs">HW</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && renderHome()}
              {activeTab === 'engine' && renderContentEngine()}
              {activeTab === 'proof' && renderProofBank()}
              {activeTab === 'frameworks' && renderFrameworks()}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-8">
                  <h2 className="font-mono text-2xl uppercase italic">Settings</h2>
                  <Card className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-mono text-sm font-bold uppercase">AI Configuration</h3>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-zinc-400">Tone of Voice</label>
                        <select className="w-full p-2 border border-black font-mono text-sm focus:outline-none">
                          <option>Direct & Bold</option>
                          <option>Analytical & Precise</option>
                          <option>Empathetic & Story-driven</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-mono text-sm font-bold uppercase">Integrations</h3>
                      <div className="flex items-center justify-between p-3 border border-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center"><Send size={16} /></div>
                          <span className="font-mono text-xs">Signal Messenger</span>
                        </div>
                        <Badge>Coming Soon</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
