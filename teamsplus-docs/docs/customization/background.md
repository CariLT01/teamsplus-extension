# Background

Customize your background with amazing wallpapers or cool GIFs.

## So how do I use it?

There should be a section called *Backgrounds* in the "Edit current settings" menu. The background field requires special CSS syntax. I'll just cover the basics:

- `url("...")` Specify URL to an image / animated images. Supported formats include:
    - PNG
    - JPG / JPEG
    - GIF
    - AVIF

- `center` Centers the image

- `cover` Ensures the image covers the parent element
- `no-repeat` prevents image from repeating
- `linear-gradient(...)` creates a linear gradient (go search online)
- `radial-gradient(...)` creates a radial gradient



For gradients, you can use [this website](https://cssgradient.io/) to generate them. Just make sure to remove `background: ` from the final result! The extension automatically applies the `background` property value, so only paste the value.

!!! example
    Here's a basic example with linear-gradient:
    ```css
    linear-gradient(to right, red, yellow)
    ```

    If you want to learn more, you can do a quick search online.

You can read more at: [https://developer.mozilla.org/en-US/docs/Web/CSS/background](https://developer.mozilla.org/en-US/docs/Web/CSS/background)


!!! example
    This set of options will suffice for most images and wallpapers.

    ```css
    url("https://...") center / cover no-repeat
    ```

    - `url("https://...")` specifies the url
    - `center` makes it centered
    - `cover` ensures it covers the whole interface
    - `no-repeat` ensures the image does not repeat

    !!! note
        Multiple keywords can be combined, like center, cover, and no-repeat.

!!! bug
    Images or GIFs with lower resolutions may be blurry. One solution is to upscale the image with nearest neighbor sampling.
