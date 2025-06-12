# TeamsPlus documentation  
Transform your Microsoft Teams experience with easy-to-use personalization tools. Adjust colors, fonts, spacing, and more to make Teams feel like *yours*.

> **Important note**
> This documentation is outdated.

---

> **Important Note**  
> This tool is still in early development. You might encounter unfinished features or occasional bugs—we appreciate your patience as we improve!

> **Important note**
> Your theme will not apply in certain locked parts such as the Assignements tab, Files tab, Word tab, and more.

---

# What’s Coming Next?  

### **Security & Privacy**  
- Private messaging using advanced encryption (from TeamsEncryption)  
- Private messaging with easy-to-remember passcodes (from TeamsEncryption)  
- Block specific users  

### **Customization**  
- Set your own background image  
- Browse pre-made themes in a theme store (no setup required!)  

### **Productivity Tools**  
- Automatically leave inactive groups  
- Organize chats into custom categories  

### **Fun Extras**  
- Earn points through mini-games  
- Add sound effects and background music  

…and more surprises in the works!  


---

# How to remove the extension
1. Go to the extensions menu in the browser.
2. Find TeamsPlus extension
3. Click remove

> **Important note**
> This will also remove all of your settings. There will be no way to recover them without a backup.

---

# Add Your Own Fonts  
Change how text appears in Teams using fonts you choose.

---

## Using Google Fonts  
Follow the 8 steps below. Don't feel discouraged, there are *only* 8 steps.

1. Visit [Google Fonts](https://fonts.google.com)  
2. Find a font you like and click on it.
3. Click on **Get font**
4. Click **Get embed code**  
5. Choose **@import** under the *Web* tab  
6. Copy the line that starts with `@import url('...')`. It is in the box labeled *'Embed code in the \<head\> of your html'*. Here is an example of what it may look like: 
``` html
<style>
@import url('https://fonts.googleapis.com/...'); // <-- Look for this line
</style>
``` 
Make sure you copy the whole line. Here is what you need to copy:
``` css
@import url('https://fonts.googleapis.com/...');
```
Make sure to include the `@import` at the beginning of the line, the URL, and the semicolon at the end.

> **Note**
> The URL has been truncated for this example. In reality, it should be much longer. Triple dots (...) in this example are used here to indicate that more data will be present.

7. Find the font name in the example text (look for `font-family: "FontName";` – copy the name inside quotes). It is in the second box. Here is an example of what it may look like (the font here is Inter):
``` css

.inter {
  font-family: "Inter", sans-serif; // <-- Font name is here (in this case, the font name is "Inter")
  font-optical-sizing: auto;
  font-style: normal;
}
```
Look for the font-family. Here is the line you should look for:
```
font-family: "Inter", sans-serif;
```
In this example, the font name is `"Inter"`. The font name is most likely the first name surrounded in quotes after `font-family: `. Make sure to copy the font name with the quotation marks. Note that the name surrounded in quotation marks can be anything.

8. In the extension settings:  
   - Paste the `@import` line into *Additional custom imports*  
   - Type the font name in quotes (e.g., `"DynaPuff"`) into the fonts box.

---

## I can't import a font from Google Fonts! Help!!!!!

**If the font does not apply or is the wrong font**, it either means you have done something wrong or the font failed to load or is unavailable. To check if your font failed to load, follow the following steps:
1. In the fonts input box, after `"<font name>"`, add `, cursive` (without quotation marks). Here's what that looks like:
Before:
```
"<font name>"
```
After:
```
"<font name>", cursive
```

Here's a full example for people who still can't understand for some reason:

>The font name used for this example will be "Inter".

In the fonts input box:
Before:
```
"Inter"
```
After:
```
"Inter", cursive
```

In summary, you add `, cursive` after your font name, including the comma (,).

If you see that the second font got applied, but the first one didn't, it means that the first font failed to load and you should choose another font. Otherwise, it probably means you have done something wrong and you should revise the steps before. If you still can't get it working after revising, too bad.

---

## Using Other Font Websites  
Follow the same steps as above. You’ll need:  
- A line starting with `@import` (provided by the font website)  
- The exact font name (usually shown in their instructions)  

It is not guaranteed that fonts from other websites will work properly. Try to use Google Fonts as much as possible.

---

## Tips for Font Names  
- Always put font names in quotes: `"Arial"`  
- Add backup fonts separated by commas:  
  `"Arial", sans-serif` (uses Arial first, then default font)  
- Some common fonts work without setup:  
  `cursive`, `sans-serif`, `"Courier"`, and many others  

> **Note:** Fonts won’t apply to certain locked parts of Teams (like embedded documents or videos).

---

# Twemoji (twitter emoji) set support
By enabling Twemoji support, the extension will attempt to replace all the Teams emojis with Twemoji equivalents. Please note that there may be a slight performance overhead when this is enabled.

Internet connection is required for emojis to load.

> **Note:**
> This feature is currently experimental. Occasional glitches may occur.

---

# Customize Colors  
Change the look of Teams by adjusting colors to match your style.

---

## Basic Color Settings  
1. Open the extension menu  
2. Find the color group name you want to change. Each group changes a part of the Teams web interface. A group name usually begins with `var.` or `class.`.
3. Use the color picker to choose the color. A color picker supports transparency.

>**Note**
> Currently no descriptions have been added to any group name. You will have to figure out what each group does to the interface. Group descriptions will be added in the future.
---

## Important Note  
Your color changes won’t apply to:  
- Embedded content (like documents or videos)  
- Some locked parts of Teams  

# Adjust Design Details  
Fine-tune specific elements like rounded corners, text sizes, and spacing.

---

## Basic Adjustments  
1. Find the setting you want to change:  
   - **Corner roundness** (e.g., sharp edges vs. rounded buttons)  
   - **Text sizes**  
   - **Spacing** between elements
   - **Font weight** bold vs. light
   - **Line height** space between each line
   - **Font size** how big the text is  
2. Enter a number value (most settings use pixels – like `5px` for 5 pixels)  

> Start with small changes (1-10px) for best results.

---

## Advanced Shadow Effects  
Add depth with shadows:  
1. Use pre-made examples from [this gallery](https://getcssscan.com/css-box-shadow-examples)  
2. Copy and paste any shadow code into the appropriate field. **Important note**: Make sure to remove `box-shadow: ` from the copied code as this is automatically added during runtime. **Please make sure to only paste box-shadow code in places where you are meant to input code for box-shadows!!** This means any group that begins with `var.--shadow`.

> 🔍 *Need help?* Learn how shadows work [here](https://www.w3schools.com/css/css3_shadows_box.asp).

---

## Font weight
Font weight is measured using an integer number from **100 to 900**. 100 is very light and 900 is bold.

---

## Measurement Tips  
- Most values use **pixels** (numbers with `px`), like `8px`  
- You can also use percentages (`50%`) or other units if you know them  
- See all measurement options [here](https://www.w3schools.com/cssref/css_units.php)  

> ⚠️ Stick with pixels unless you're comfortable with other units.

# Save and Restore Your Settings  

## Save Your Customization  
Backup your theme or share it with others:  
1. Click any **Copy Settings** button  
2. Your theme data will be copied as text  
3. Save this text in a document/note for later  

> Works like copying text – no files to download  



## Load a Saved Customization  
Apply a backup or use someone else's theme:  
1. Click any **Import Settings** button  
2. Paste your saved text into the box  
3. Confirm to apply the changes  


> **Important:**  
> - This replaces your current settings  
> - Only use text you trust (shared themes affect your Teams look)  

## Export your Settings as a Theme

You can export your settings as a theme which you can name. This will export all your settings in one string, making it easy to distribute.

1. Click *Export everything as theme*
2. This will copy your settings to your clipboard.

> **Note**
> Sometimes it says *failed to copy*. This is a bug. Follow the instructions in the popup if that happens.

## Import your Settings from a Theme

You can import settings from someone else's theme. Unlike importing settings directly, this will not replace your current settings.

1. Click on *Import a theme*
2. A box will appear for you to paste the data. Simply paste your data.
3. Press OK

---

## Delete everything
Press the delete button located on the very top. This will reset everything to default. **There is no way to undo this.**

---

# Encryption

TeamsPlus encryption is a useless service, but it can still be used if you want I guess.

## Encrypting and decrypting

You first need an account. Go create one at [https://apiteamsplus.pythonanywhere.com/register](https://apiteamsplus.pythonanywhere.com/register). Please remember your encryption key when signing up as there is no way to recover them if you forget them.

**How to encrypt**

1. Click on the lock button in the sidebar.
2. Search for an account and select the one you want to encrypt for.
3. Type the content you want to encrypt
4. Press encrypt. A *enter your password* popup should popup.
5. Enter your encryption key associated with your account. If you forgot them, please see *I forgot my encryption key please help* section.
6. A login popup will appear if needed. Simply enter your credentials. 
7. The encrypted message will be shown on the bottom and copied to your clipboard (if available).
8. Send the ciphertext to the destinated person. A *decrypt* button should appear below all encrypted messages.

If you got *Internal server error* message, it may mean:

- Invalid login credentials or encryption key.
- Missing data or invalid request to the server
- Any other server error

**How to decrypt**

1. Click the *decrypt* button on a message.
2. Enter the encryption key associated with YOUR ACCOUNT. If you forgot them, please see *I forgot my encryption key please help* section.
3. A login screen will appear if needed. Simply enter your credentials to continue.
4. A popup with the decrypted content should appear.

If you got *Internal server error* message, it may mean:

- Invalid login credentials or encryption key.
- Invalid message format or missing data/field.
- Message authenticity cannot be verified.
- Message cannot be decrypted with your keys or not meant to be read by you.
- Any other server error


## I forgot my encryption key please help

**There is no way to recover your encryption key.** The encryption key is needed to decrypt the real encryption key associated with your account. Without this key, we (TeamsPlus) are unable to decrypt any message you sent and destined to you.

---

# Minigame

Help about the fun minigame.

## Why am I not winning?

I don't know lol.

---

# Contribute

Contributing to the project, if you want to, somehow.

## Contributing to Group Descriptions

Documentation on this will come soon, as it is quite complicated.

## Contributing to Default Themes

Documentation on this will come soon, as it is quite complicated.