import { HomeDiscovery } from "@/components/home/home-discovery";
import { HomeHeroSearch } from "@/components/home/home-hero-search";

export default function HomePage() {
  return (
    <main>
      <HomeHeroSearch />
      <HomeDiscovery />
    </main>
  );
}
