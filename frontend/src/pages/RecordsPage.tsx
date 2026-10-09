import { FileText, Share, ShieldAlert } from 'lucide-react';

export function RecordsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Medical Records</h1>
      
      <div className="shadow-lg rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 font-semibold text-sm capitalize">
          <div>Hospital</div>
          <div>Visit Date</div>
          <div>Records</div>
          <div>Status</div>
        </div>

        <RecordsRow 
          hospital="City General Hospital" 
          date="Nov 15, 2026" 
          recordsCount={3}
          hasRecords={true}
        />
        <RecordsRow 
          hospital="Memorial Medical Center" 
          date="Sep 8, 2026" 
          recordsCount={2}
          hasRecords={true}
        />
        <RecordsRow 
          hospital="+3 more" 
          date="—" 
          recordsCount={12}
          hasRecords={true}
        />
      </div>
    </div>
  );
}

function RecordsRow({ hospital, date, recordsCount, hasRecords }: any) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50">
      <div className="font-medium text-gray-900">{hospital}</div>
      <div className="text-gray-600">{date}</div>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">{recordsCount} files</span>
      </div>
      <div>
        <Share className="w-4 h-4 text-green-600" />
      </div>
    </div>
  );
}
