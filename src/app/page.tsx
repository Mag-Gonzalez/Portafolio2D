import AvatarScene from "@/components/AvatarScene";
import ExperienceRoot from "@/components/experience/ExperienceRoot";
import ContentLayer from "@/components/ui/ContentLayer";
import MediaLayer from "@/components/media/MediaLayer";

export default function Home() {
  return (
    <ExperienceRoot>
      <AvatarScene />
      <ContentLayer />
      <MediaLayer />
    </ExperienceRoot>
  );
}
