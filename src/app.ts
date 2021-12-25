import { Toast, ToastMsgItem, ToastType } from "./Toast";

window.onload = () => {
  const btns = document.querySelectorAll("#app .btn[action]");
  btns.forEach((b) => {
    b.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const type = target.getAttribute("action") as ToastType;
      const maxCount = +(
        document.getElementById("toast-max-count") as HTMLFormElement
      ).value;
      const timer =
        +(document.getElementById("toast-timer") as HTMLFormElement).value || 0;
      Toast.setMaxCount(maxCount);
      const messageText = (
        document.getElementById("toast-msg") as HTMLFormElement
      ).value;
      let msg: ToastMsgItem[] = [messageText];
      if (target.hasAttribute("cycle")) {
        msg = [
          messageText,
          {
            text: "Show Next",
            call: () => {
              target.click();
            },
          },
        ];
        const types = [
          ToastType.Success,
          ToastType.Error,
          ToastType.Warn,
          ToastType.Info,
        ];
        const next = types[types.indexOf(type) + 1] || types[0];
        target.setAttribute("action", next);
      }
      new Toast({
        type: type,
        msg,
        timer,
      });
    });
  });
};
