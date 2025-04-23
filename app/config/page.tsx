import { EnvConfig } from "@/components/env-config"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConfigPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Application Configuration</h1>

        <EnvConfig />

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/api-test">Test API Connection</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
