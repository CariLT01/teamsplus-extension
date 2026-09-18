import { ExtensionStorageProvider } from "./storage/ExtensionStorageProvider";

const RULE_IDS = {
  CONSUMPTION_HORIZON: 1001,
  PRESENCE_POST: 1002,
};

let stealthLast = false;

export async function setStealthMode(enabled: boolean): Promise<void> {
const allRuleIds = Object.values(RULE_IDS);
  if (enabled) {
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: allRuleIds,
      addRules: [
        {
          id: RULE_IDS.CONSUMPTION_HORIZON,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK
          },
          condition: {
            urlFilter: "*teams.microsoft.com/api/chatsvc/*/properties?name=consumptionhorizon*",
            requestMethods: [
              chrome.declarativeNetRequest.RequestMethod.PUT
            ],
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              chrome.declarativeNetRequest.ResourceType.OTHER
            ]
          }
        },
        {
          id: RULE_IDS.PRESENCE_POST,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
          },
          condition: {
            urlFilter: '*teams.microsoft.com/ups/*/v1/presence/getpresence*',
            requestMethods: [chrome.declarativeNetRequest.RequestMethod.POST],
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              chrome.declarativeNetRequest.ResourceType.OTHER,
            ],
          },
        },
      ]
    });
    console.log('[TeamsPlus] Stealth mode enabled via DNR');
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: allRuleIds
    });
    console.log('[TeamsPlus] Stealth mode disabled');
  }
}

export async function run() {
    setInterval(async () => {
        const stealthEnabled = await ExtensionStorageProvider.loadKey("stealthRead") ? true : false;

        if (stealthLast !== stealthEnabled) {
            setStealthMode(stealthEnabled);
            stealthLast = stealthEnabled;
        } else {
            const k = await ExtensionStorageProvider.loadKey("stealthRead");
            console.log("No change: ", k);
        }
    }, 200);

    console.log("Initialized!");
}

run();