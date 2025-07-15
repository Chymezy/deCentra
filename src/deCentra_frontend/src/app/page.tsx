import Hero from '@/components/home/Hero';
import ProblemSection from '@/components/home/ProblemSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import RoadmapSection from '@/components/home/RoadmapSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <RoadmapSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
