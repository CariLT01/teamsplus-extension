/**
 * File: contribution/defaultThemes.ts
 * Contribute to creating default themes for the extension.
 * 
 * Example of how to write a theme
 * 
 * const aDefaultThemes: {[key: string]: string} = { // Varaiable declaration
 * ... more themes above ...
 * '<Your theme name>': `<Your theme data> (you can get it through theme export, just paste the data here)`,
 * }
 * This is probably very unclear. Just follow examples on the bottom.
 * Read the docs for more info.
 * 
 */


// VERY IMPORTANT! Please make sure to replace all your single backward slash ('\') with double backward slashes ('\\'). If this is not done, your theme will not load properly!
const aDEFAULT_THEMES: {[key: string]: string} = { /*Variable declaration*/
    // Themes go here:
    'Default Teams Theme': `{"data":{"varColors":{},"classColors":{},"fonts":{"fontFamily":"-apple-system, BlinkMacSystemFont, \\"Segoe UI\\", system-ui, \\"Apple Color Emoji\\", \\"Segoe UI Emoji\\", sans-serif","imports":""},"otherSettings":{},"twemojiSupport":false},"name":"Default Teams Theme","data_version":1}`,
    'Cozy Dark Blue theme': `{"data":{"varColors":{"--colorNeutralForeground1":"#FFFFFF","--colorNeutralForeground2":"#FFFFFF","--colorNeutralForeground3":"#777AC6","--colorBrandForegroundLink":"#54D0FF","--colorBrandForegroundLinkHover":"#FFFFFF","--colorBrandForeground1":"#FFFFFF","--colorBrandForeground2":"#FFFFFF","--colorBrandForeground2Hover":"#FFFFFF","--colorNeutralForegroundInverted":"#FFFFFF","--colorNeutralBackground1":"#002457","--colorNeutralBackground2":"#000000","--colorNeutralBackground3":"#000E57","--colorNeutralBackground4":"#000000","--colorNeutralBackground5":"#001271","--colorBrandBackground":"#000000","--colorBrandBackgroundHover":"#828282","--colorBrandBackground2":"#00527C","--colorBrandBackgroundInverted":"#FFFFFF","--colorNeutralCardBackground":"#202020","--colorNeutralStrokeAccessibleSelected":"#FFFFFF","--colorNeutralStroke1":"#00000000","--colorNeutralStroke2":"#0756AE00","--colorNeutralStroke3":"#002B7C00","--colorNeutralStrokeSubtle":"#E0E0E000","--colorNeutralStrokeOnBrand":"#FFFFFF00","--colorNeutralStrokeOnBrand2":"#FFFFFF00","--backgroundCanvas":"#002985","--colorAvatar":"#FFFFFF","--colorAvatarBackground":"#C9CFFF","--colorDefaultBackground7":"#001D54","--colorTeamsBrand1Hover":"#FFFFFF"},"classColors":{"ff":"#FFFFFF","oh":"#FFFFFF","jg":"#00000000","ui-toolbar__item":"#FFFFFF","oi":"#FFFFFF","fui-StyledText":"#FFFFFF"},"fonts":{"fontFamily":"\\"Inter\\", courier","imports":"@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');"},"otherSettings":{"--borderRadiusMedium":"20px"},"twemojiSupport":true},"name":"Cozy Dark Blue theme","data_version":1}`,
}


////// Do not change anything under this line  /////////
////// unless you know what you are doing      /////////

export const DEFAULT_THEMES = aDEFAULT_THEMES; /*Module export*/