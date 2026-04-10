import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';

export const metadata = {
  title: 'VeriVolunte — Connect. Volunteer. Impact.',
  description: 'Find volunteering events near you. Connect with verified NGOs and make a real difference.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
