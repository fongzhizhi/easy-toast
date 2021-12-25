import { Toast, ToastType } from "./Toast";

window.onload = () => {
  const btns = document.querySelectorAll("#app .btn[action]");
  btns.forEach((b) => {
    b.addEventListener("click", (e) => {
      const type = (e.target as Element).getAttribute("action") as ToastType;
      new Toast({
        type,
        msg: (document.getElementById("toast-msg") as HTMLFormElement).value,
        timer:
          +(document.getElementById("toast-timer") as HTMLFormElement).value ||
          0,
      });
    });
  });
};
