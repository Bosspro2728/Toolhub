import Link from 'next/link';
import {
  FileText,
  Calculator,
  Terminal,
  Palette,
  Brain,
  Cloud,
  Package,
  FileEdit,
  Pencil,
} from 'lucide-react';

const CategoryGrid = () => {
  const categories = [
    {
      title: 'Documents',
      description: 'Edit, convert, and manage documents',
      icon: FileText,
      path: '/documents',
      tools: 8,
    },
    {
      title: 'Calculators',
      description: 'Perform various calculations',
      icon: Calculator,
      path: '/calculators',
      tools: 6,
    },
    {
      title: 'Code Tools',
      description: 'Developer utilities and helpers',
      icon: Terminal,
      path: '/code',
      tools: 6,
    },
    {
      title: 'Color Tools',
      description: 'Generate colors and palettes',
      icon: Palette,
      path: '/color',
      tools: 2,
    },
    {
      title: 'AI Tools',
      description: 'Artificial intelligence powered utilities',
      icon: Brain,
      path: '/ai',
      tools: 5,
    },
    {
      title: 'Cloud Storage',
      description: 'Store and access your files',
      icon: Cloud,
      path: '/cloud-storage',
      tools: 1,
    },
    {
      title: 'Extra Tools',
      description: 'Additional useful utilities',
      icon: Package,
      path: '/extra-tools',
      tools: 7,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {categories.map((category, index) => (
        <Link
          key={index}
          href={category.path}
          className="group flex flex-col p-6 bg-card border rounded-lg transition-all hover:shadow-md hover:border-primary/50"
        >
          <div className="p-2 mb-4 rounded-lg bg-primary/10 text-primary w-fit">
            <category.icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
            {category.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground flex-grow">
            {category.description}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            {category.tools} tools
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;