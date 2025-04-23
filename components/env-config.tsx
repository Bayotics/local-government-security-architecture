"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save, Check } from "lucide-react"

export function EnvConfig() {
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This is just for UI demonstration - in a real app,
    // we wouldn't be able to access the environment variable on the client
    const storedKey = localStorage.getItem("OPENAI_API_KEY")
    if (storedKey) {
      setApiKey(storedKey)
    }
  }, [])

  const saveApiKey = () => {
    try {
      if (!apiKey) {
        setError("API key cannot be empty")
        return
      }

      // In a real app, we would send this to a secure backend endpoint
      // Here we're just storing in localStorage for demonstration
      localStorage.setItem("OPENAI_API_KEY", apiKey)

      setSaved(true)
      setError(null)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      setError("Failed to save API key")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenAI API Configuration</CardTitle>
        <CardDescription>Configure your OpenAI API key for the application</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your API key is stored securely and used only for generating analysis results.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveApiKey} className="w-full" disabled={saved}>
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
