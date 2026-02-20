import { Chatbot } from "@/components/chatbot";
import CTASection from "@/components/landingpage/cta-section";
import Features from "@/components/landingpage/features";
import FooterSection from "@/components/landingpage/footer";
import Hero from "@/components/landingpage/hero-section";
import HowItWorks from "@/components/landingpage/how-it-works";
import SocialProof from "@/components/landingpage/social-proof";

export default function Home() {
    return (
        <>
            <Hero />
            <SocialProof />
            <Features />
            <HowItWorks />
            <CTASection />
            <FooterSection />
            <Chatbot />
        </>
    );
}
