import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const TestimonialSection = () => {
  const testimonials = [
    {
      quote: "ToolHub can completely transformed my workflow. The document tools save me hours each week!",
      author: "",
      role: "Marketing Director",
      avatar: "AQ"
    },
    {
      quote: "As a developer, I rely on ToolHub's code utilities daily. The code formatter and JSON validator are indispensable.",
      author: "",
      role: "Senior Developer",
      avatar: "AQ"
    },
    {
      quote: "The AI tools are incredibly powerful. The ai text generator has been a game-changer for my research work.",
      author: "",
      role: "Research Scientist",
      avatar: "AQ"
    }
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied users who have improved their productivity with our tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary">{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <blockquote className="text-lg italic">"{testimonial.quote}"</blockquote>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;