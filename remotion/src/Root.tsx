import { Composition } from "remotion";
import { ThirtyThreeGod } from "./ThirtyThreeGod";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ThirtyThreeGod"
      component={ThirtyThreeGod}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
