import { Chatbot } from "@/components/chatbot";
import Features from "@/components/landingpage/features";
import FooterSection from "@/components/landingpage/footer";
import Hero from "@/components/landingpage/hero-section";

export default function Home() {
    return (
        <>
            <Hero />
            <Features />
            <FooterSection />
            <Chatbot />
        </>
    );
}
