import { Download } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-2xl font-semibold text-slate-800">Fluffy Download Button</h1>

        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95">
          <Download size={12} />
          Download
        </button>
      </div>
    </div>
  )
}
