import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import CategoryGrid from '@/components/landing-page/category-grid';

export default function ServicesPage() {
  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="All Services"
        description="Browse our complete collection of tools and utilities."
      />
      <h6>Any tool marked with <b>pro</b> means that it has limitations like day limits for free users. Upgrade to pro to unlock the full potential of these tools.</h6>
      <Separator className="my-6" />
      
      <div className="py-6">
        <CategoryGrid />
      </div>
    </div>
  );
}