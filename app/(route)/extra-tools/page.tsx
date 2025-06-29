import { PageHeader } from '@/components/shared/page-header';
import ToolCard from '@/components/shared/tool-card';
import { Separator } from '@/components/ui/separator';
import { tools } from '@/constant/tools';

export default function ExtraToolsPage() {
  const extraTools = [];
  for (const tool of tools) {
    if (tool.category === 'Extra Tools') {
      extraTools.push({
        title: tool.title,
        description: tool.description,
        icon: tool.icon,
        path: tool.path,
        isNew: tool.isNew,
        hasPro: tool.hasPro,
      });
    }
  }
  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Extra Tools"
        description="Explore utilities that help you think, convert, and simplify everyday tasks"
      />
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {extraTools.map((tool, index) => (
          <ToolCard
            key={index}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            path={tool.path}
            category="Extra Tools"
            isNew={tool.isNew}
            isPro={tool.hasPro}
          />
        ))}
      </div>
    </div>
  );
}
