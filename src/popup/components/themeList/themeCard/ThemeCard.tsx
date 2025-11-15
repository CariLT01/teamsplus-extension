import { Button } from "../../Button";
import { TripleDotsButton } from "../../TripleDotsButton";

interface Props {
  themeName: string;
  themeData: string;
}

export function ThemeCard(props: Props) {
  return (
    <div className="px-4 py-4 border border-black/10 rounded-md w-full">
      <div>
        <div className="flex items-center gap-4 justify-between">
          <span className="text-2xl font-bold">{props.themeName}</span>

          <TripleDotsButton onClick={() => {}}></TripleDotsButton>
        </div>
        <span className="text-base text-black/50">A TeamsPlus theme</span>
      </div>
      <div>
        <Button isSecondary={true} icon={null} smaller={true}>
          Apply
        </Button>
      </div>
    </div>
  );
}
