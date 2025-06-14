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

```css 
.inter {
  font-family: "Inter", sans-serif; // Font name is here (in this case, the font name is "Inter")
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

!!! note
    Fonts won’t apply to certain locked parts of Teams (like embedded documents or videos).
