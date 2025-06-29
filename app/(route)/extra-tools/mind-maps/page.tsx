"use client";

import { useRef, useState } from 'react';
import mermaid from 'mermaid';
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Download, Share2, Minimize } from 'lucide-react';
import Editor from '@monaco-editor/react';

mermaid.initialize({ startOnLoad: false });

export default function MindMapsPage() {
  const [code, setCode] = useState(`pie title What Voldemort doesn't have?\n
         "FRIENDS" : 2\n
         "FAMILY" : 3\n
         "NOSE" : 45`);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderMermaid = () => {
    if (diagramRef.current) {
      try {
        const sanitizedCode = code.trim();
        mermaid.parse(sanitizedCode);
        diagramRef.current.innerHTML = '';
        const graphDiv = document.createElement('div');
        graphDiv.className = 'mermaid';
        graphDiv.textContent = sanitizedCode;
        diagramRef.current.appendChild(graphDiv);
        mermaid.init(undefined, graphDiv);
      } catch (err: any) {
        diagramRef.current.innerHTML = `<p class='text-red-500'>${err?.str || 'Invalid Mermaid syntax'}</p>`;
      }
    }
  };

  const exportSVG = () => {
    const svg = diagramRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    a.click();

    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

   const examples = [
    {
      code: `graph TD\n    A[Start] --> B[Process]\n    B --> C[Decision]\n    C -->|Yes| D[Do This]\n    C -->|No| E[Do That]`,
      description: 'A simple flowchart with a decision node using Mermaid syntax.'
    },
    {
      code: `sequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: I am good thanks!`,
      description: 'A sequence diagram showing interaction between participants.'
    },
    {
      code: `classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra`,
      description: 'A class diagram representing inheritance.'
    },
    {
      code: `pie\n    title What Voldemort doesn't have?\n    \"FRIENDS\" : 2\n    \"FAMILY\" : 3\n    \"NOSE\" : 45`,
      description: "A pie chart showing humorous distribution."
    },
    {
      code: `timeline\n    title History of Social Media Platform\n    2002 : LinkedIn\n    2004 : Facebook\n         : Google\n    2005 : YouTube\n    2006 : Twitter`,
      description: "A timeline showing the emergence of social media platforms."
    },
    {
      code: `journey\n    title My working day\n    section Go to work\n      Make tea: 5: Me\n      Go upstairs: 3: Me\n      Do work: 1: Me, Cat\n    section Go home\n      Go downstairs: 5: Me\n      Sit down: 5: Me`,
      description: "A journey diagram showing daily routine."
    },
    {
      code: `---\ntitle: Example Git diagram\n---\ngitGraph\n   commit\n   commit\n   branch develop\n   checkout develop\n   commit\n   commit\n   checkout main\n   merge develop\n   commit\n   commit`,
      description: "A Git graph showing typical development workflow."
    },
    {
      code: `xychart-beta\n    title \"Sales Revenue\"\n    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]\n    y-axis \"Revenue (in $)\" 4000 --> 11000\n    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\n    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`,
      description: "A bar and line chart representing sales revenue over months."
    },
    {
      code: `architecture-beta\n    group api(cloud)[API]\n\n    service db(database)[Database] in api\n    service disk1(disk)[Storage] in api\n    service disk2(disk)[Storage] in api\n    service server(server)[Server] in api\n\n    db:L -- R:server\n    disk1:T -- B:server\n    disk2:T -- B:db`,
      description: "A cloud architecture diagram showing API services and interactions."
    }
  ];

  return (
    <div className="container py-6 md:py-8 relative">
      <PageHeader
        title="Mind Maps"
        description="Create and organize your ideas visually"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Mind Map Editor">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="hover:bg-green-500" onClick={renderMermaid}>
                  Render &gt;
                </Button>
                <Button variant="outline" onClick={toggleFullscreen}>
                  Fullscreen
                </Button>
                <Button variant="outline" onClick={exportSVG}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Editor
                  height="300"
                  language="markdown"
                  theme="vs-dark"
                  value={code}
                  options={{ minimap: { enabled: false } }}
                  onChange={(value) => setCode(value || '')}
                />
                <div className="relative"  ref={containerRef}>
                  <div
                    ref={diagramRef}
                    className="p-4 rounded-md bg-white dark:bg-muted overflow-auto h-[80vh] w-full"
                  ></div>
                  {isFullscreen && (
                    <Minimize
                      onClick={toggleFullscreen}
                      className="absolute top-2 right-2 z-10 cursor-pointer bg-background text-foreground rounded-full p-1 shadow"
                    />
                  )}
                </div>
              </div>
            </div>
          </ToolWrapper>

          <ToolWrapper title="Examples">
            <div className="space-y-6">
              {examples.map((example, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md bg-muted">
                  <pre className="text-sm bg-background p-3 rounded-md overflow-auto">
                    {example.code}
                  </pre>
                  <div className="text-sm text-muted-foreground">
                    {example.description}
                  </div>
                </div>
              ))}
            </div>
          </ToolWrapper>

          <ToolWrapper title="Mermaid Syntax Guide">
            <div className="text-sm space-y-4 text-muted-foreground">
              <p>Mermaid supports various diagram types such as:</p>
              <ul className="list-disc list-inside">
                <li><strong>Flowchart</strong>: <code>graph TD</code>, <code>graph LR</code></li>
                <li><strong>Sequence Diagram</strong>: <code>sequenceDiagram</code></li>
                <li><strong>Class Diagram</strong>: <code>classDiagram</code></li>
                <li><strong>State Diagram</strong>: <code>stateDiagram-v2</code></li>
                <li><strong>Entity Relationship Diagram</strong>: <code>erDiagram</code></li>
                <li><strong>Gantt Chart</strong>: <code>gantt</code></li>
                <li><strong>Pie Chart</strong>: <code>pie</code></li>
                <li><strong>Git Graph</strong>: <code>gitGraph</code></li>
                <li><strong>Journey Diagram</strong>: <code>journey</code></li>
                <li><strong>Requirement Diagram</strong>: <code>requirementDiagram</code></li>
                <li><strong>Quadrant Chart</strong>: <code>quadrantChart</code></li>
                <li><strong>Mindmap</strong>: <code>mindmap</code></li>
                <li><strong>Timeline</strong>: <code>timeline</code></li>
                <li><strong>Sankey</strong>: <code>sankey-beta</code></li>
                <li><strong>Architecture</strong>: <code>architecture-beta</code></li>
                <li><strong>Radar</strong>: <code>radar-beta</code></li>
                <li><strong>XY Chart</strong>: <code>xychart-beta</code></li>
                <li><strong>Tittle Pie Chart</strong>: <code>pie title title/(NETFLI)</code></li>
              </ul>
              <p>Refer to the official <a className="text-blue-500" href="https://mermaid.js.org/syntax/flowchart.html?id=flowcharts-basic-syntax" target="_blank">Mermaid documentation</a> for a complete reference.</p>
            </div>
          </ToolWrapper>
        </div>

        <div>
          <ToolWrapper title="Pro Features (coming soon)">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Real-time Collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Work together with your team
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Layouts</p>
                <p className="text-sm text-muted-foreground">
                  More layout options and customization
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Templates</p>
                <p className="text-sm text-muted-foreground">
                  Access professional templates
                </p>
              </div>
              {/* <div className="mt-4 text-center">
                <Button>Upgrade to Pro</Button>
              </div> */}
            </div>
          </ToolWrapper>
        </div>
      </div>
    </div>
  );
}
