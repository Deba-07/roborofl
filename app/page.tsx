import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/sections/hero/HeroSection";
import Hero from "@/components/sections/hero/Hero";
import StatsSection from "@/components/sections/stats/StatsSection";
import ProblemSection from "@/components/sections/problems/ProblemSection";
import HowItWorksSection from "@/components/sections/howitworks/HowItWorksSection";
import WhoWeServeSection from "@/components/sections/whoweserve/WhoWeServeSection";
import NetworkSection from "@/components/sections/network/NetworkSection";
import ForPagesSection from "@/components/sections/forpages/ForPageSection";
import ForBrandsSection from "@/components/sections/forbrands/ForBrandsSection";
import Footer from "@/components/sections/footer/Footer";
import HeroV2 from "@/components/sections/hero/Herov2";
import HeroV3 from "@/components/sections/hero/Herov3";
import HeroV4 from "@/components/sections/hero/Herov4";
import HeroV5 from "@/components/sections/hero/Herov5";
import HeroV6 from "@/components/sections/hero/HeroV6";
import HeroV7 from "@/components/sections/hero/HeroV7";
import HeroV8 from "@/components/sections/hero/HeroV8";
import HeroV9 from "@/components/sections/hero/HeroV9";
import HeroV10 from "@/components/sections/hero/HeroV10";
import HeroV13 from "@/components/sections/hero/HeroV13";
import HeroV14 from "@/components/sections/hero/HeroV14";
import HeroV15 from "@/components/sections/hero/HeroV15";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* <HeroSection /> */}
      <HeroV2 />
      {/* <HeroV3 /> */}
      {/* <HeroV4 /> */}
      {/* <HeroV5 /> */}
      {/* <HeroV6 /> */}
      {/* <HeroV7 /> */}
      {/* <HeroV8 /> */}
      {/* <HeroV9 /> */}
      {/* <HeroV10 /> */}
      {/* <HeroV13 /> */}
      {/* <HeroV14 /> */}
      {/* <HeroV15 /> */}
      {/* <Hero /> */}
      <StatsSection />
      <ProblemSection />
      <HowItWorksSection />
      <WhoWeServeSection />
      <NetworkSection />
      <ForPagesSection />
      <ForBrandsSection />
      <Footer />
    </>
  );
}