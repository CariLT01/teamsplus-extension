declare const __DESKTOP_APP__: boolean;

declare module "*.css?asString" {
    const content: string;
    export default content;
}