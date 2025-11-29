import React, { useState } from 'react';
import { TreeExperience } from './components/TreeExperience';
import { TreeState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  const toggleState = () => {
    setTreeState(prev => prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <TreeExperience treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        
        {/* Header */}
        <div className="text-center mt-4">
          <h1 className="text-4xl md:text-6xl font-bold font-luxury tracking-widest text-gold-gradient drop-shadow-lg">
            THE GRAND
          </h1>
          <h2 className="text-xl md:text-2xl mt-2 text-yellow-100 font-serif italic tracking-wide opacity-90">
            Interactive Christmas Collection
          </h2>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col items-center pointer-events-auto">
          <div className="backdrop-blur-sm bg-black/40 p-1 rounded-full border border-yellow-800/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <button
              onClick={toggleState}
              className={`
                relative px-12 py-4 rounded-full text-lg font-bold font-luxury tracking-wider transition-all duration-700
                border border-yellow-600/50 group overflow-hidden
                ${treeState === TreeState.FORMED 
                  ? 'bg-gradient-to-r from-yellow-900 to-yellow-700 text-yellow-100 shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                  : 'bg-black/60 text-yellow-600 hover:text-yellow-200 hover:bg-black/80'}
              `}
            >
              <span className="relative z-10 flex items-center gap-3">
                {treeState === TreeState.FORMED ? 'SCATTER TO CHAOS' : 'ASSEMBLE THE TREE'}
              </span>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
            </button>
          </div>
          
          <p className="mt-4 text-yellow-600/60 text-xs tracking-[0.2em] font-luxury uppercase">
            A WebGL Experience • 2024 Holiday
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;