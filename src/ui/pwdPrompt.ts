import { p_stringToElement } from "../utils";

const code = `
    <div class="password-popup" id="pwd-popup">
        <h3>Enter password</h3>
        <p>Enter password to encryption key</p>

        <input type="text" name="popup-pwd" id="popup-pwd-input" class="popup-pwd" autocomplete="off">

        <button type="button" id="ok-btn">OK</button>
    </div>`;

export async function promptAndWait() {
  const popupElement = p_stringToElement(code) as HTMLDivElement;
  document.body.appendChild(popupElement);

  const input = popupElement.querySelector<HTMLInputElement>('input.popup-pwd')!;
  const okBtn = popupElement.querySelector<HTMLButtonElement>('button')!;

  input.focus();

  return new Promise<string>((resolve) => {
    const cleanup = () => {
      okBtn.removeEventListener('click', onOk);
      input.removeEventListener('keyup', onKeyUp);
      if (popupElement.parentNode) {
        popupElement.parentNode.removeChild(popupElement);
      }
    };

    const onOk = () => {
      resolve(input.value);
      cleanup();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onOk();
      }
    };

    okBtn.addEventListener('click', onOk);
    input.addEventListener('keyup', onKeyUp);
  });
}
