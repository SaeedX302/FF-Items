import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-2xl font-semibold text-foreground">Fluffy Download Button</h1>

        <Button
          size="sm"
          className="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-4 py-2 text-sm font-medium border-0 hover:scale-105"
        >
          <Download className="w-3 h-3 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}
