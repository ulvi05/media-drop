import ConverterCard from "./components/converter-card";
import Footer from "./components/footer";
import Hero from "./components/hero";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ConverterCard />
      <Footer />
    </>
  );
}
