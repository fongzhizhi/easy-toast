// ==============> 相关类型定义
/**
 * Toast配置
 */
export interface ToastConfig {
  /**消息类型 */
  type: ToastType;
  /**消息体 */
  msg: ToastMsgItem | ToastMsgItem[];
  /**自动关闭时间(毫秒) */
  timer: number;
}
/**
 * Toast信息类型
 */
export enum ToastType {
  /**成功 */
  Success = "success",
  /**失败|错误 */
  Error = "error",
  /**警告 */
  Warn = "warn",
  /**信息 */
  Info = "info",
}
/**
 * Toast消息体
 */
export interface ToastMsgBody {
  /**消息文本 */
  text: string;
  /**消息回调 */
  call?: Function;
  /**附加的类名 */
  class?: string;
}
export type ToastMsgItem = string | ToastMsgBody;

// ==============> 相关默认配置
/**
 * 默认配置
 */
const defaultConfig: ToastConfig = {
  type: ToastType.Info,
  msg: "This is a toast message.",
  timer: 3000,
};
/**消息面板模板 */
const msgTemp = `
<div id="<%= id %>" class="toast-panel">
    <div class="body <%= type %>">
        <div class="icon <%= icon %>"></div>
        <div class="msg"><%= msg-body %></div>
        <div class="btns">
            <div class="timer <%= timer-class %>"><%= timer %></div>
            <div class="close">x</div>
        </div>
    </div>
</div>`;
const defaultContainer = "toast-container";

// ==============> Class
/**
 * Toast Message
 */
export class Toast {
  /**Toast的容器 */
  static container: string = "#" + defaultContainer;
  /**配置信息 */
  readonly config: ToastConfig;
  /**消息面板ID */
  private panelId: string = "";
  /**回调函数 */
  private calls: Function[] = [];

  /**
   * 设置Toast的容器位置
   * @param selectors string 选择器
   */
  static setContainer(selectors: string) {
    this.container = selectors;
  }

  constructor(config: Partial<ToastConfig>) {
    this.config = this.initConfig(config);
    if (!this.config.msg) {
      return;
    }
    this.show(this.createPanel());
  }

  /**
   * 配置初始化
   */
  private initConfig(config: Partial<ToastConfig>): ToastConfig {
    const c: ToastConfig = Object.assign({}, defaultConfig, config);
    c.timer = Math.round(c.timer);
    if (c.timer < 0) {
      c.timer = defaultConfig.timer;
    }
    return c;
  }

  /**
   * 创建Toast面板
   */
  private createPanel() {
    const c = this.config;
    // 消息体的创建
    const msg = Array.isArray(c.msg) ? c.msg : [c.msg];
    let msgBody = "";
    msg.forEach((item) => {
      if (typeof item === "string") {
        msgBody += `<span>${item}</span>`;
      } else {
        if (item.call) {
          this.calls.push(item.call);
          msgBody += `<a class="${item.class}" call-index="${
            this.calls.length - 1
          }">${item.text}</a>`;
        } else {
          msgBody += `<span class="${item.class}">${item.text}</span>`;
        }
      }
    });
    // 面板
    this.panelId = "toast-" + new Date().getTime();
    const panelHtml = this.rendTemplate(msgTemp, {
      id: this.panelId,
      type: c.type,
      icon: "icon-toast-" + c.type,
      timer: this.convertPanelTimer(c.timer),
      "timer-class": c.timer === 0 ? "hidden" : "",
      "msg-body": msgBody,
    });
    // 创建节点
    const fragement = document.createDocumentFragment();
    const nodes = new DOMParser().parseFromString(panelHtml, "text/html").body
      .childNodes;
    nodes.forEach((n) => fragement.append(n));
    // 绑定事件
    fragement
      .querySelector(".btns > .close")
      .addEventListener("click", this.close.bind(this));
    if (this.calls.length > 0) {
      fragement.querySelectorAll("a[call-index]").forEach((item) => {
        item.addEventListener("click", (e) => {
          const index = +(e.target as Element).getAttribute("call-index");
          const call = this.calls[index];
          call && call.apply(null);
        });
      });
    }
    return fragement;
  }

  /**
   * 更新模板
   */
  private rendTemplate(temp: string, obj: { [key: string]: string }) {
    if (!obj || !temp) {
      return temp;
    }
    for (let key in obj) {
      temp = temp.replace(new RegExp(`<%=\\s*(${key})\\s*%>`, "g"), obj[key]);
    }
    return temp;
  }

  /**
   * 初始化Toast面板
   */
  private initContainer(): Element {
    const container = document.createElement("div");
    container.id = defaultContainer;
    document.body.appendChild(container);
    return container;
  }

  private convertPanelTimer(timer: number) {
    return Math.round(timer / 1000 || 0).toString();
  }

  private getPanel() {
    return document.getElementById(this.panelId) as HTMLElement;
  }

  private getPanelTimerEle() {
    return this.getPanel().querySelector(".btns > .timer");
  }

  private getPanelTimer() {
    return parseFloat(this.getPanelTimerEle().textContent) * 1000;
  }

  private updatePanelTimer(timer: number) {
    return (this.getPanelTimerEle().textContent =
      this.convertPanelTimer(timer));
  }

  /**
   * 显示
   */
  private show(fragement: DocumentFragment) {
    if (!fragement) {
      return;
    }
    let container = document.querySelector(Toast.container);
    if (!container) {
      container = this.initContainer();
    }
    container.appendChild(fragement);
    // 入场动画
    const enterClass = "enter-in";
    const panel = this.getPanel();
    panel.classList.add(enterClass);
    const marginBottom = 7;
    panel.style.height = (panel.clientHeight || 44) + marginBottom + "px";
    const enterTimer = 300;
    panel.classList.add(enterClass);

    setTimeout(() => {
      panel.classList.remove(enterClass);
      // 倒计时自动关闭
      let timer = this.config.timer;
      if (timer === 0) {
        return;
      }
      timer -= enterTimer;
      if (timer < 0) {
        this.close();
        return;
      }
      const timerGap = 1000;
      const leaveTimer = 300;
      this.updatePanelTimer(timer);
      const timerIntervalId = setInterval(() => {
        const panelTimer = this.getPanelTimer() - timerGap;
        if (panelTimer < leaveTimer) {
          clearInterval(timerIntervalId);
          setTimeout(() => {
            this.close();
          }, Math.max(0, panelTimer - leaveTimer));
        } else {
          this.updatePanelTimer(panelTimer);
        }
      }, timerGap);
    }, enterTimer);
  }

  /**
   * 关闭
   */
  private close() {
    const panel = this.getPanel();
    if (!panel) {
      return;
    }
    this.panelId = "";
    // 离场动画
    const leaveTimer = 300;
    panel.classList.add("leave-to");
    setTimeout(() => {
      panel.parentElement.removeChild(panel);
    }, leaveTimer);
  }
}
