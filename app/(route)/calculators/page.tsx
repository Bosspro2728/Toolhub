import { PageHeader } from '@/components/shared/page-header';
import ToolCard from '@/components/shared/tool-card';
import { Separator } from '@/components/ui/separator';
import { tools } from '@/constant/tools'

export default function CalculatorsPage() {
  const calculators = [];
  for (const tool of tools) {
    if (tool.category === 'Calculators') {
      calculators.push({
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
        title="Calculators & Converters"
        description="Powerful calculation tools for mathematics, finance, and data analysis"
      />
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {calculators.map((calculator, index) => (
          <ToolCard
            key={index}
            title={calculator.title}
            description={calculator.description}
            icon={calculator.icon}
            path={calculator.path}
            category="Calculator"
            isNew={calculator.isNew}
            isPro={calculator.hasPro}
          />
        ))}
      </div>
    </div>
  );
}