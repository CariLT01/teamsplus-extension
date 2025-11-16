import { Button } from "./Button";
import { ContextMenu } from "./contextMenu/ContextMenu";
import { InputDialog } from "./dialog/InputDialog";
import { EditorSelectionPage } from "./editSelectionMenu.tsx/EditorSelectionPage";
import { Header } from "./header/Header";
import { ThemeList } from "./themeList/ThemeList";


export function App() {
    return <div>
        <Header></Header>
        <EditorSelectionPage></EditorSelectionPage>
        <ThemeList></ThemeList>
        <ContextMenu></ContextMenu>
        <InputDialog></InputDialog>
    </div>
}