import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ToolWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideHeader?: boolean;
}

export default function ToolWrapper({
  title,
  description,
  children,
  className,
  contentClassName,
  hideHeader = false,
}: ToolWrapperProps) {
  return (
    <Card className={cn('border shadow-sm', className)}>
      {!hideHeader && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn('', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}