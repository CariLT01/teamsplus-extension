import { Button } from "../../Button";
import { TransparentButton } from "../../TransparentButton";

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

          <TransparentButton
            onClick={() => {}}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#1f1f1f"
              >
                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
              </svg>
            }
          ></TransparentButton>
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
