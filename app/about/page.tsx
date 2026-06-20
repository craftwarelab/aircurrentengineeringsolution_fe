import HeroSection from "@/components/hero-section";
import { Award, Users, Lightbulb, Target } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description:
        "We maintain the highest standards of engineering excellence in every project.",
    },
    {
      icon: Users,
      title: "Customer Focus",
      description:
        "Your satisfaction and success are at the center of everything we do.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously invest in new technologies and methodologies.",
    },
    {
      icon: Award,
      title: "Integrity",
      description:
        "We conduct our business with honesty, transparency, and accountability.",
    },
  ];

  const timeline = [
    {
      year: "2015",
      title: "Beginnings",
      description:
        "Air Current Eng. Solution was founded by a group of HVAC professionals with a shared vision.",
    },
    {
      year: "2018",
      title: "Growth",
      description:
        "We expanded our services to include HVAC and ventilation engineering.",
    },
    {
      year: "2020",
      title: "Company Founded",
      description:
        "Air Current Eng. Solution was established as a small HVAC consulting firm.",
    },
    {
      year: "2021",
      title: "Expansion",
      description:
        "We expanded our services to include HVAC and ventilation engineering.",
    },
    {
      year: "2022",
      title: "Major Expansion",
      description: "Expanded to include installation and maintenance services.",
    },
    {
      year: "2023",
      title: "Industry Recognition",
      description:
        "Awarded Best HVAC Engineering Firm by Regional Chamber of Commerce.",
    },
    {
      year: "2024",
      title: "Technology Integration",
      description:
        "Launched smart building controls and IoT integration services.",
    },
    {
      year: "2025",
      title: "National Expansion",
      description:
        "Expanded services to three additional states with regional offices.",
    },
    {
      year: "2026",
      title: "Sustainability Focus",
      description:
        "Became carbon-neutral operations and leading green HVAC provider.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="About Air Current Eng. Solution"
        subtitle="Our Story"
        description="Over 20 years of excellence in HVAC and ventilation engineering, serving commercial and industrial clients across the region."
      />

      {/* Mission & Vision */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                To deliver exceptional HVAC and ventilation engineering
                solutions that enhance comfort, ensure health and safety, and
                optimize operational efficiency for our clients. We are
                committed to exceeding expectations through innovation,
                expertise, and customer dedication.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We believe that superior engineering, combined with reliable
                service, creates lasting value for the organizations we serve.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Our Vision
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                To be the most trusted and innovative HVAC engineering partner
                in the region, known for technical excellence, sustainable
                solutions, and unwavering commitment to client success.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We envision a future where advanced engineering and smart
                technology create healthier, more efficient buildings that
                benefit both occupants and the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-card rounded-lg p-8 border border-border text-center"
                >
                  <Icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Our Journey
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-accent/20" />

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div key={item.year} className="relative">
                  <div
                    className={`md:flex gap-8 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-1 justify-end pr-8">
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-accent rounded-full mt-2 border-4 border-background" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pl-0 md:pl-0">
                      <div className="bg-card border border-border rounded-lg p-6">
                        <p className="text-accent font-bold text-lg">
                          {item.year}
                        </p>
                        <h3 className="text-lg font-semibold text-foreground mt-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Highlights */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Team</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            With over 15 dedicated professionals, Air Current Eng. Solution
            brings together expertise across HVAC design, installation, project
            management, and customer service. Our team includes licensed
            engineers, certified technicians, and experienced project managers
            committed to delivering excellence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-4xl font-bold text-primary mb-2">15+</p>
              <p className="text-foreground font-semibold">
                Skilled Team Members
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Engineers, technicians, and support staff
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-4xl font-bold text-primary mb-2">95%</p>
              <p className="text-foreground font-semibold">
                Certified Professionals
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Licensed engineers and technicians
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-4xl font-bold text-primary mb-2">1500+</p>
              <p className="text-foreground font-semibold">
                Projects Delivered
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Across commercial and industrial sectors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Why Partner With Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Proven Track Record
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    8+ years of successful projects and satisfied clients
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Expert Team</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Licensed engineers with specialized certifications
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Latest Technology
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Smart controls and IoT integration for optimal performance
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Complete Solutions
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    From design through installation and ongoing support
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Sustainability Focused
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Energy-efficient solutions that reduce your carbon footprint
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-accent-foreground font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Responsive Support
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    24/7 emergency service and preventive maintenance programs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
