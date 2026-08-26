import { HomeDiscovery } from "@/components/home/home-discovery";
import { HomeHeroSearch } from "@/components/home/home-hero-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobPlatform - Tìm việc làm phù hợp",
  description:
    "Khám phá cơ hội việc làm từ các công ty uy tín và tìm công việc phù hợp với bạn.",
};
export default function HomePage() {
  return (
    <main>
      <HomeHeroSearch />
      <HomeDiscovery />
    </main>
  );
}
