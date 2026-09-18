<<<<<<< HEAD
import { Button } from "./Button";
import { ContextMenu } from "./contextMenu/ContextMenu";
import { InputDialog } from "./dialog/InputDialog";
import { EditorSelectionPage } from "./editSelectionMenu.tsx/EditorSelectionPage";
import { Header } from "./header/Header";
import { ThemeList } from "./themeList/ThemeList";


export function App() {
    return <div className="overflow-auto scrollable w-full h-full">
        <Header></Header>
        <EditorSelectionPage></EditorSelectionPage>
        <ThemeList></ThemeList>
        <ContextMenu></ContextMenu>
        <InputDialog></InputDialog>
    </div>
=======
import { Button } from "./Button";
import { ContextMenu } from "./contextMenu/ContextMenu";
import { InputDialog } from "./dialog/InputDialog";
import { EditorSelectionPage } from "./editSelectionMenu.tsx/EditorSelectionPage";
import { Header } from "./header/Header";
import { ThemeList } from "./themeList/ThemeList";


export function App() {
    return <div className="overflow-auto scrollable w-[100vw] h-[100vh]">
        <Header></Header>
        <EditorSelectionPage></EditorSelectionPage>
        <ThemeList></ThemeList>
        <ContextMenu></ContextMenu>
        <InputDialog></InputDialog>
    </div>
>>>>>>> origin/main
}