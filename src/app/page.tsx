import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, BarChart2, BookOpen, Zap, Shield, Clock, Globe } from "lucide-react";

export default function Home() {
  return (
    <>
      <div >
        <div >
          <Header />
          <main className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <section className="text-center mb-24">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Revolutionize Your Academic Journey with Athenium
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Athenium is the all-in-one platform that empowers students and educators to streamline coursework, enhance collaboration, and achieve academic excellence.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href='/about'>Learn More</Link>
                </Button>
              </div>
            </section>

            {/* Key Features Section */}
            <section className="mb-24">
              <h2 className="text-3xl font-bold text-center mb-12">Powerful Features to Elevate Your Education</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Users className="h-8 w-8 text-blue-500" />}
                  title="Intuitive Classroom Management"
                  description="Create and manage virtual classrooms with ease. Organize students, assignments, and resources effortlessly."
                />
                <FeatureCard
                  icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                  title="Comprehensive Assignment Tracking"
                  description="Create, submit, and grade assignments seamlessly. Monitor deadlines and submission statuses in real-time."
                />
                <FeatureCard
                  icon={<Calendar className="h-8 w-8 text-purple-500" />}
                  title="Smart Attendance System"
                  description="Take attendance digitally and generate insightful reports to track student participation over time."
                />
                <FeatureCard
                  icon={<BarChart2 className="h-8 w-8 text-orange-500" />}
                  title="In-depth Analytics"
                  description="Gain valuable insights into classroom performance and engagement with detailed analytics and visualizations."
                />
                <FeatureCard
                  icon={<BookOpen className="h-8 w-8 text-red-500" />}
                  title="Centralized Resource Hub"
                  description="Share and access course materials, lecture notes, and additional resources within each classroom environment."
                />
                <FeatureCard
                  icon={<Zap className="h-8 w-8 text-yellow-500" />}
                  title="Real-time Collaboration"
                  description="Foster teamwork and communication with built-in collaboration tools for group projects and discussions."
                />
              </div>
            </section>

            {/* How It Works Section */}
            <section className="mb-24">
              <h2 className="text-3xl font-bold text-center mb-12">How Athenium Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Join or Create a Classroom</h3>
                  <p>Easily set up virtual classrooms or join existing ones with a simple invite code.</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Access Course Materials</h3>
                  <p>Find all your course resources, assignments, and discussions in one centralized location.</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Submit and Track Progress</h3>
                  <p>Complete assignments, track your progress, and receive instant feedback from educators.</p>
                </div>
              </div>
            </section>


            {/* CTA Section */}
            <section className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Academic Experience?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join Athenium today and discover a new way to manage your academic life. Streamline your coursework, collaborate with peers, and achieve your educational goals.
              </p>
              <Button asChild size="lg">
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 Athenium. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
