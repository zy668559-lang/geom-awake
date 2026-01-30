
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowRight, Activity, Zap, CheckSquare, ArrowLeft, Menu } from 'lucide-react';

interface ReportData {
  coreIssueTag: string;
  kidTalk: string;
  commandLine: string;
  fixPlan: string[];
  nextTraining: string;
  parentSummary: string;
}

interface SessionData {
  id: string;
  timestamp: string;
  grade: string;
  report: ReportData;
}

async function getSessionData(id: string): Promise<SessionData | null> {
  const filePath = path.join(process.cwd(), 'data', 'sessions', `${id}.json`);
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionData(id);

  if (!session) {
    return <div className="p-8 text-center">报告未找到</div>;
  }

  const { report } = session;

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full">
            <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
            <h1 className="font-bold text-slate-800 text-sm">诊断报告</h1>
        </div>
        <button className="p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-full">
            <Menu size={20} />
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border-t-8 border-blue-600">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {session.grade}年级几何体检报告
            </span>
            <span className="text-slate-400 text-xs">{new Date(session.timestamp).toLocaleDateString()}</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">你的几何思维诊断：</h1>
          <div className="text-4xl font-extrabold text-blue-600 mb-6">
            {report.coreIssueTag.replace(/_/g, ' ')}
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl text-lg font-medium text-blue-900 italic leading-relaxed">
            “{report.kidTalk}”
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold">觉醒口令</h2>
          </div>
          
          {(report as any).commandLines && Array.isArray((report as any).commandLines) ? (
            <div className="grid gap-4">
              {(report as any).commandLines.map((line: string, idx: number) => (
                <div 
                  key={idx} 
                  className="text-center p-6 bg-slate-900 text-white rounded-2xl text-2xl font-bold tracking-widest shadow-lg shadow-slate-200 transform hover:scale-[1.02] transition-transform"
                >
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-900 text-white rounded-2xl text-2xl font-bold tracking-widest shadow-lg shadow-slate-200 transform hover:scale-[1.02] transition-transform">
              {report.commandLine}
            </div>
          )}
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <CheckSquare size={24} />
            </div>
            <h2 className="text-xl font-bold">三步修复计划</h2>
          </div>
          
          <div className="space-y-4">
            {report.fixPlan.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-slate-700 font-medium mt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parent Summary */}
        <div className="bg-slate-100 rounded-3xl p-6 text-sm text-slate-500 leading-relaxed mb-8">
          <span className="font-bold text-slate-700 block mb-1">给家长的话：</span>
          {report.parentSummary}
        </div>
        
        {/* Retest Links (Future) */}
        <div className="flex justify-between text-xs text-slate-400 px-4 mb-4">
            <Link href="/review" className="hover:text-blue-500">7天复检入口</Link>
            <Link href="/review" className="hover:text-blue-500">15天复检入口</Link>
        </div>

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-100 z-50">
          <div className="max-w-2xl mx-auto">
            <Link href={report.repairPackId ? `/train?packId=${report.repairPackId}` : `/train?model=${report.nextTraining}`} className="block">
              <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors animate-pulse">
                开始专项修复 <ArrowRight size={20} />
              </button>
            </Link>
          </div>
      </div>
    </div>
  );
}
