import React from 'react';
import Carousel from './components/Carousel';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col selection:bg-emerald-500/30 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center z-20 relative">
        <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Interactive Gallery</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
          AIGC造物：西南地区少数民族文化emoji
        </h1>
        <p className="max-w-xl mx-auto text-zinc-500 text-lg font-light leading-relaxed">
          Select a card to generate and reveal the cultural artifact.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center relative w-full">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-gradient-to-tr from-emerald-100/30 to-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Carousel */}
        <Carousel />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-zinc-100 relative z-20">
        <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
          © 2024 AIGC Cultural Heritage Project
        </p>
      </footer>
    </div>
  );
};

export default App;