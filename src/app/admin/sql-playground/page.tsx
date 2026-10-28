'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, Play, Database, CheckCircle2, 
  Code2, ArrowLeft, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function SqlPlaygroundPage() {
  const [selectedKey, setSelectedKey] = useState('cte_peakhours');
  const [queryData, setQueryData] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const queryOptions = [
    {
      id: 'cte_peakhours',
      title: 'Query 1: Peak-Hour Load Analysis (CTE)',
      unit: 'Unit 2 & 3: Advanced SQL (CTE, GROUP BY, CASE)'
    },
    {
      id: 'window_denserank',
      title: 'Query 2: Station Revenue Ranking (Window Function)',
      unit: 'Unit 2: Analytical Window Functions (OVER, DENSE_RANK)'
    },
    {
      id: 'view_status',
      title: 'Query 3: Station Operational Dashboard (Relational View)',
      unit: 'Unit 1 & 2: Database Views with Conditional Aggregation'
    },
    {
      id: 'nosql_pipeline',
      title: 'Query 4: IoT Battery Thermal Stress (NoSQL MongoDB)',
      unit: 'Unit 4: NoSQL Aggregation Framework ($match, $group, $project)'
    }
  ];

  const handleRunQuery = async (keyToRun = selectedKey) => {
    setExecuting(true);
    try {
      const res = await fetch('/api/sql-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryKey: keyToRun })
      });

      const data = await res.json();
      if (data.success) {
        setQueryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Academic Evaluation Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            SQL & NoSQL Query Viva Playground
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive console to execute and inspect the DBMS Level 3 syllabus queries live
          </p>
        </div>

        <Link
          href="/admin"
          className="self-start md:self-auto px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Hub</span>
        </Link>
      </div>

      {/* Query Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Syllabus Demonstration Query:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {queryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedKey(opt.id);
                handleRunQuery(opt.id);
              }}
              className={`p-3 rounded-xl border text-left transition ${
                selectedKey === opt.id
                  ? 'bg-purple-50/80 border-purple-400 text-purple-900 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-xs">{opt.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{opt.unit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Query Runner & Display Box */}
      <div className="space-y-6">
        
        {/* SQL Editor / Code Block */}
        <div className="bg-slate-950 rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-slate-100">
          <div className="bg-slate-900/90 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">
                {queryData?.title || 'Click Execute Query Below'}
              </span>
            </div>

            <button
              disabled={executing}
              onClick={() => handleRunQuery()}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{executing ? 'Executing...' : 'Run Query Live'}</span>
            </button>
          </div>

          <div className="p-6 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed bg-slate-950">
            <pre>
              {queryData?.sqlText || `-- Select a query above and click "Run Query Live" to execute.`}
            </pre>
          </div>

          {queryData?.concept && (
            <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2 font-mono">
              <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{queryData.concept}</span>
            </div>
          )}
        </div>

        {/* Live Result Table */}
        {queryData?.result && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Query Execution Output</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Status: 200 OK • {Array.isArray(queryData.result) ? queryData.result.length : 1} Records Retrieved
              </span>
            </div>

            <div className="overflow-x-auto">
              {Array.isArray(queryData.result) && queryData.result.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      {Object.keys(queryData.result[0]).map((key) => (
                        <th key={key} className="py-3 px-4 font-mono">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {queryData.result.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        {Object.values(row).map((val: any, vIdx: number) => (
                          <td key={vIdx} className="py-3 px-4">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No records returned or custom format.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
