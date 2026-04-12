import React from 'react';
import { Brain, Zap, Sparkles, Info, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { AIAnalysisResult } from '../types';

interface AIAnalysisProps {
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  runAIAnalysis: () => void;
}

export const AIAnalysis = ({ aiAnalysis, isAnalyzing, runAIAnalysis }: AIAnalysisProps) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">Analyse Logistique IA</h3>
            <p className="text-slate-500 text-xs lg:text-sm">Insights prédictifs et optimisation des stocks.</p>
          </div>
        </div>
        <button 
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          className={cn(
            "w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md",
            isAnalyzing ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
          )}
        >
          {isAnalyzing ? (
            <>
              <Zap className="w-5 h-5 animate-pulse" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Relancer l'Analyse
            </>
          )}
        </button>
      </div>

      {!aiAnalysis && !isAnalyzing && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-indigo-600" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Prêt pour l'analyse</h4>
          <p className="text-slate-500 max-w-md mx-auto">
            L'IA va analyser vos stocks de nourriture, munitions, uniformes et matériels pour identifier les risques de rupture et optimiser les ressources.
          </p>
          <button 
            onClick={runAIAnalysis}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Démarrer l'Analyse
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-20 bg-slate-50 rounded"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {aiAnalysis && !isAnalyzing && (
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                <Info className="w-4 h-4" />
                Résumé Stratégique Global
              </div>
              <p className="text-xl leading-relaxed font-medium">
                {aiAnalysis.globalSummary}
              </p>
              <div className="mt-6 text-slate-400 text-xs">
                Dernière mise à jour : {aiAnalysis.lastUpdated}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAnalysis.insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{insight.category}</h4>
                    {insight.subUnit && (
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                        {insight.subUnit}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    insight.status === 'Critique' ? "bg-red-100 text-red-700" :
                    insight.status === 'Attention' ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {insight.status}
                  </span>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Observation</p>
                    <p className="text-sm text-slate-700">{insight.observation}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Recommandation</p>
                    <p className="text-sm text-slate-900 font-medium">{insight.recommendation}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-indigo-600">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-xs font-bold italic">{insight.prediction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
