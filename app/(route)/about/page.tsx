import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Shield, Clock } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Award,
      title: "Quality Tools",
      description: "We provide high-quality, reliable tools that help you work more efficiently."
    },
    {
      icon: Users,
      title: "User-Focused",
      description: "Our platform is designed with users in mind, making it easy to find and use the tools you need."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data security and privacy are our top priorities. We use industry-standard encryption."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Our tools are available whenever you need them, with reliable uptime and performance."
    }
  ];

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="About ToolHub"
        description="Learn more about our mission and values"
      />
      <Separator className="my-6" />
      
      <div className="max-w-3xl mx-auto">
        <div className="prose dark:prose-invert">
          <p className="text-xl text-muted-foreground">
            ToolHub is your one-stop platform for all the tools you need to enhance your productivity
            and streamline your workflow. We believe in making powerful tools accessible to everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to empower individuals and businesses with accessible, powerful tools
            that enhance productivity and creativity. We strive to make complex tasks simple and
            provide solutions that work for everyone.
          </p>
          
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            Founded in 2025, ToolHub began with a simple idea: to create a platform where users
            could find all the tools they need in one place. Since then, we've grown to serve
            thousands of users worldwide, continuously expanding our toolkit with innovative
            solutions.
          </p>
        </div>
      </div>
    </div>
  );
}