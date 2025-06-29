import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  category?: string;
  isNew?: boolean;
  isPro?: boolean;
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  path,
  category,
  isNew = false,
  isPro = false,
}: ToolCardProps) {
  return (
    <Link href={path} className="group">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex gap-2">
              {isNew && (
                <Badge variant="default\" className="bg-primary">New</Badge>
              )}
              {isPro && (
                <Badge variant="default" className="bg-amber-500">PRO</Badge>
              )}
            </div>
          </div>
          <CardTitle className="mt-3 text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {category && (
          <CardFooter className="pt-2">
            <Badge variant="outline">{category}</Badge>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}