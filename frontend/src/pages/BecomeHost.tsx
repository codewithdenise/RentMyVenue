import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModalType } from "@/components/auth/AuthModals";

interface BecomeHostProps {
  openAuthModal: (type: AuthModalType, signupRole?: "user" | "vendor") => void;
}

const BecomeHost: React.FC<BecomeHostProps> = ({ openAuthModal }) => {
  const { isAuthenticated, user } = useAuth();

  // Benefits of being a host
  const benefits = [
    {
      title: "Earn Extra Income",
      description:
        "Turn your venue into a source of revenue. Hosts on RentMyVenue earn an average of $2,500 per booking.",
    },
    {
      title: "Flexible Schedule",
      description:
        "You control your venue's availability. Block dates when you need your space and accept bookings when it's convenient.",
    },
    {
      title: "Simple Management",
      description:
        "Our platform handles payments, contracts, and customer communication, making venue management hassle-free.",
    },
    {
      title: "Marketing Support",
      description:
        "We professionally showcase your venue with photography tips, description assistance, and promotional features.",
    },
  ];

  // Steps to become a host
  const steps = [
    {
      number: 1,
      title: "Create an account",
      description: "Sign up as a venue host on our platform.",
    },
    {
      number: 2,
      title: "List your venue",
      description:
        "Add photos, descriptions, pricing, and availability for your space.",
    },
    {
      number: 3,
      title: "Get verified",
      description:
        "We'll review your listing to ensure it meets our quality standards.",
    },
    {
      number: 4,
      title: "Start hosting",
      description: "Accept booking requests and start earning with your venue.",
    },
  ];

  const handleSignUp = () => {
    openAuthModal("signup", "vendor");
  };

  const handleGoToDashboard = () => {
    if (user?.role === "vendor") {
      window.location.href = "/vendor/dashboard";
    } else {
      window.location.href = "/user/dashboard";
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://source.unsplash.com/featured/?indian,wedding,venue")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Share Your Venue With The World
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Turn your space into a destination for memorable weddings and
              events. Join RentMyVenue and start earning.
            </p>
            {isAuthenticated ? (
              <Button size="lg" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={handleSignUp}>
                Get Started
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Host on RentMyVenue</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our platform makes it easy to manage your venue and maximize your
              earnings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <Card key={i} className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How to Become a Host</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Follow these simple steps to list your venue and start hosting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Button size="lg" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={handleSignUp}>
                Become a Host
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What Our Hosts Say</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Hear from venue owners who've found success on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                venue: "Lakeside Manor",
                image:
                  "https://source.unsplash.com/random/100x100/?woman,portrait&sig=1",
                text: "Since listing my venue on RentMyVenue, I've had consistent bookings throughout the year. The platform handles all the details, making it easy for me to manage my property.",
              },
              {
                name: "Michael Chen",
                venue: "Urban Garden Loft",
                image:
                  "https://source.unsplash.com/random/100x100/?man,portrait&sig=2",
                text: "I was hesitant at first, but RentMyVenue has exceeded my expectations. The quality of clients and the support from the team has been outstanding.",
              },
              {
                name: "Priya Patel",
                venue: "Sunset Vineyard",
                image:
                  "https://source.unsplash.com/random/100x100/?woman,portrait&sig=3",
                text: "What I love most is the flexibility. I can block off dates for my own events while still earning significant income during the wedding season.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.venue}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">"{testimonial.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Everything you need to know about hosting on RentMyVenue
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How much does it cost to list my venue?",
                answer:
                  "Listing your venue on RentMyVenue is completely free. We only charge a 5% commission when you successfully book a client through our platform.",
              },
              {
                question: "How do I receive payments?",
                answer:
                  "Payments are processed securely through our platform. Once a booking is completed, funds are transferred to your preferred payment method (bank account, PayPal, etc.) within 24 hours.",
              },
              {
                question: "What if a client cancels?",
                answer:
                  "Our cancellation policy protects hosts. Depending on when the cancellation occurs, you'll receive either a full or partial payment according to your venue's cancellation terms.",
              },
              {
                question: "Do I need insurance?",
                answer:
                  "Yes, we recommend all hosts have appropriate liability insurance. Additionally, RentMyVenue provides a Host Protection Insurance program that offers up to $1M in liability coverage.",
              },
              {
                question: "How quickly will my venue be approved?",
                answer:
                  "Most venues are reviewed and approved within 48-72 hours. Once approved, your listing will be live and visible to potential clients.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Button size="lg" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={handleSignUp}>
                Start Hosting Today
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Share Your Venue?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of hosts who are earning income by sharing their
            spaces on RentMyVenue
          </p>
          {isAuthenticated ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGoToDashboard}
              className="min-w-[200px]"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSignUp}
              className="min-w-[200px]"
            >
              Become a Host
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default BecomeHost;
