import { IdleJs } from "../../src/index.ts";

const status = document.querySelector("#status")!;
const visibility = document.querySelector("#visibility")!;
const lastActiveEl = document.querySelector("#lastActive")!;
const timeoutInput = document.querySelector("#timeout") as HTMLInputElement;

const idle = new IdleJs({
  idle: 3000,
  onIdle: () => {
    status.textContent = "Idle! (no activity for 3s)";
    status.classList.add("idle");
  },
  onActive: () => {
    status.textContent = "Active!";
    status.classList.remove("idle");
  },
  onHide: () => {
    visibility.textContent = "Hidden";
    visibility.classList.add("idle");
  },
  onShow: () => {
    visibility.textContent = "Visible";
    visibility.classList.remove("idle");
  },
}).start();

setInterval(() => {
  lastActiveEl.textContent = `lastActive: ${new Date(idle.lastActive).toLocaleTimeString()} · idle=${idle.idle}`;
}, 500);

document.querySelector("#apply")!.addEventListener("click", () => {
  idle.set({ idle: Number(timeoutInput.value) || 3000 });
});
document.querySelector("#stop")!.addEventListener("click", () => idle.stop());
document.querySelector("#start")!.addEventListener("click", () => idle.start());
