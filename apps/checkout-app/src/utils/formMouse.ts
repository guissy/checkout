export function setFormElementsDisabled(form: HTMLFormElement, disabled: boolean) {
  const inputButton = 'input, textarea, select, button, a';
  form.querySelectorAll(inputButton).forEach((element) => {
    (element as HTMLInputElement).disabled = disabled;
  });
  form.querySelectorAll('[role="combobox"]').forEach((element) => {
    (element as HTMLInputElement).style.pointerEvents = disabled ? "none" : "auto";
  });
}
