import { useNavigationStore } from "../../store/NavigationStore";
import { useThemesListStore } from "../../store/ThemesListStore";
import { Button } from "../Button";
import { EmptyListNotice } from "./EmptyListNotice";
import { ThemeCard } from "./themeCard/ThemeCard";

export function ThemeList() {
  const location = useNavigationStore((state) => state.location);
  const setLocation = useNavigationStore((state) => state.setLocation);
  const themes = useThemesListStore((state) => state.themes);

  if (location != "") return null;

  if (Object.keys(themes).length == 0) {
    return <EmptyListNotice></EmptyListNotice>;
  }

  const editSettingsOnClick = () => {
    setLocation("Theme Settings");
  }

  return (
    <div className="w-full flex gap-4 px-4 py-2 flex-col items-center">
      {Object.entries(themes).map(([themeName, themeData]) => {
        return (
          <ThemeCard key={themeName} themeName={themeName} themeData={themeData}></ThemeCard>
        );
      })}

      <Button
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
          >
            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
          </svg>
        }
        isSecondary={true}
      >
        Add theme
      </Button>
      <Button
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#ffffff"
          >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
          </svg>
        }
        isSecondary={false}
        onClick={editSettingsOnClick}
      >
        Edit settings
      </Button>
    </div>
  );
}
