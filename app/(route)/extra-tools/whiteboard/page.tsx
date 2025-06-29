"use client"
import { useState, useEffect, useRef } from 'react'
import { Tldraw, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Download, Save, Maximize, Minimize } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import ToolWrapper from '@/components/shared/tool-wrapper';


export default function WhiteboardPage() {
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const containerRef = useRef(null)
  // Store the Tldraw editor instance
  const [editor, setEditor] = useState(null)
  const [exportFormat, setExportFormat] = useState('png') // 'png' or 'svg'
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handleMount = (app) => {
    setEditor(app)
  }

  const handleSave = () => {
    if (!editor) {
      toast.error('Editor not ready')
      return
    }
    // Get a JSON snapshot of the document and session
    const { document, session } = getSnapshot(editor.store)
    const json = JSON.stringify({ document, session })
    console.log('Tldraw JSON snapshot:', json)
    toast.success('Snapshot JSON exported to console')
  }

  const handleDownload = async () => {
    if (!editor) {
      toast.error('Editor not ready')
      return
    }
    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) {
      toast.error('Nothing to export')
      return
    }

    try {
      if (exportFormat === 'svg') {
        // Properly await the SVG export
        const result = await editor.getSvgString(shapeIds, { withBackground: false })
        if (!result || !result.svg) {
          throw new Error('SVG export failed')
        }
        const svgContent = result.svg
        // Add XML declaration for standalone files
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgContent}`
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `drawing-${new Date().toISOString().split('T')[0]}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('SVG downloaded')
      } else {
        // Export PNG image
        const { blob } = await editor.toImage(shapeIds, { format: 'png', background: false, scale: 1 })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `drawing-${new Date().toISOString().split('T')[0]}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('PNG downloaded')
      }
    } catch (e) {
      toast.error('Failed to download image. Check if you have selected the downoload format.')
    }
  }
  
  const toggleFullScreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }

  useEffect(() => {
    const handler = () => {
      console.log('Fullscreen change event fired. fullScreen:', !!document.fullscreenElement)
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

return (
  <div className="container py-6 md:py-8">
    <PageHeader
      title="Online Whiteboard"
      description="Draw, sketch, and export your ideas visually"
    />
    <Separator className="my-6" />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ToolWrapper title="Whiteboard Editor">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleSave} variant="outline" size="sm">
                  <Save className="mr-1 h-4 w-4" /> Save
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" /> Download
                </Button>
                <Button onClick={toggleFullScreen} variant="outline" size="sm">
                  {isFullScreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle Fullscreen</span>
                </Button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="min-h-[500px] h-[500px] border rounded-lg overflow-hidden bg-white dark:bg-gray-900"
            >
              {isFullScreen && (
                <Button
                  onClick={toggleFullScreen}
                  variant="outline"
                  size="sm"
                  className="left-1/2 absolute z-10"
                >
                  <Minimize className="h-4 w-4" />
                </Button>
              )}
              <Tldraw
                onMount={handleMount}
                showUI={true}
                name="MyBoard"
                darkMode={darkMode}
                height='100'
              />
            </div>
          </div>
        </ToolWrapper>
      </div>

      <div className="space-y-6">
        <ToolWrapper title="Whiteboard Tips">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Options</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Save JSON snapshot of the session</li>
                <li>• Export drawing as PNG or SVG</li>
                <li>• Download vector or raster output</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tips</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Double-click to add shapes</li>
                <li>• Use toolbar to select tools</li>
                <li>• Use mouse wheel or touchpad to zoom</li>
              </ul>
            </div>
          </div>
        </ToolWrapper>
      </div>
    </div>
  </div>
);

}