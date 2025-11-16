import clsx from "clsx";
import { Button } from "../Button";

export function Header() {
  return (
    <div className="py-2 px-4 flex items-center justify-between border border-black/10 w-full">
      <div className="font-bold text-2xl text-black">TeamsPlus</div>
      <Button
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
          >
            <path d="m298-262-56-56 121-122H80v-80h283L242-642l56-56 218 218-218 218Zm222-18v-80h360v80H520Zm0-320v-80h360v80H520Zm120 160v-80h240v80H640Z" />
          </svg>
        }
        isSecondary={true}
        onClick={() => {
            window.open(chrome.runtime.getURL("/docs/index.html"));
        }}
      >
        Read the docs
      </Button>
    </div>
  );
}
