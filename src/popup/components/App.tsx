import { Button } from "./Button";
import { EditorSelectionPage } from "./editSelectionMenu.tsx/EditorSelectionPage";
import { Header } from "./header/Header";
import { ThemeList } from "./themeList/ThemeList";


export function App() {
    return <div>
        <Header></Header>
        <EditorSelectionPage></EditorSelectionPage>
        <ThemeList></ThemeList>
    </div>
}