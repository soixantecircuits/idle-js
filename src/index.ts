export type IdleEventName =
  | "mousemove"
  | "mousedown"
  | "keydown"
  | "touchstart"
  | "touchmove"
  | "scroll"
  | "wheel"
  | "resize"
  | (string & {});

export interface IdleOptions {
  /** Idle timeout in ms. Default 10000. Use `set({ idle })` to change at runtime. */
  idle?: number;
  /** Activity events. Default includes scroll/wheel for #26 + mobile touch. */
  events?: IdleEventName[];
  /** Called once when the user becomes idle. */
  onIdle?: (() => void) | null;
  /** Called once when activity resumes after idle. */
  onActive?: (() => void) | null;
  /** Called when the tab becomes hidden. */
  onHide?: (() => void) | null;
  /** Called when the tab becomes visible again. */
  onShow?: (() => void) | null;
  /** Keep re-arming after each idle event. Default true. */
  keepTracking?: boolean;
  /** Start in idle state. Default false (v1 quirk `true` removed). */
  startAtIdle?: boolean;
  /** Use setInterval instead of setTimeout to re-fire onIdle. Default false. */
  recurIdleCall?: boolean;
  /**
   * Event target for activity listeners. Defaults to global `window`.
   * Pass an iframe's `contentWindow` for #25, or any EventTarget in tests.
   */
  target?: EventTarget | null;
}

interface ResolvedSettings extends Required<
  Omit<IdleOptions, "target" | "onIdle" | "onActive" | "onHide" | "onShow">
> {
  onIdle: (() => void) | null;
  onActive: (() => void) | null;
  onHide: (() => void) | null;
  onShow: (() => void) | null;
  target: EventTarget | null;
}

const DEFAULTS: ResolvedSettings = {
  idle: 10000,
  events: ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"],
  onIdle: null,
  onActive: null,
  onHide: null,
  onShow: null,
  keepTracking: true,
  startAtIdle: false,
  recurIdleCall: false,
  target: null,
};

const VISIBILITY_EVENTS = ["visibilitychange"];

function resolveTarget(explicit: EventTarget | null | undefined): EventTarget | null {
  if (explicit) return explicit;
  if (typeof window !== "undefined") return window;
  return null;
}

function isHidden(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitHidden?: boolean;
    mozHidden?: boolean;
    msHidden?: boolean;
  };
  return Boolean(doc.hidden ?? doc.webkitHidden ?? doc.mozHidden ?? doc.msHidden ?? false);
}

export class IdleJs {
  settings: ResolvedSettings;
  idle: boolean;
  visible: boolean;
  /** Timestamp (ms) of last observed activity. Enables elapsed check on visibility return (#29). */
  lastActive: number;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private isInterval = false;
  private started = false;
  private stopListener: () => void;
  private activityHandler: () => void;
  private visibilityHandler: () => void;

  constructor(options: IdleOptions = {}) {
    this.throwOnBadKey(Object.keys(options), [...Object.keys(DEFAULTS), "target"]);
    this.settings = {
      ...DEFAULTS,
      ...options,
      target: (options.target ?? null) as EventTarget | null,
    } as ResolvedSettings;
    // Fresh array so instances never share DEFAULTS.events
    this.settings.events = [...(options.events ?? DEFAULTS.events)];

    this.idle = Boolean(this.settings.startAtIdle);
    this.visible = !isHidden();
    this.lastActive = Date.now();

    this.stopListener = () => this.stop();
    this.activityHandler = () => {
      this.lastActive = Date.now();
      if (this.idle) {
        this.idle = false;
        this.settings.onActive?.();
      }
      this.rearm();
    };
    this.visibilityHandler = () => {
      const hidden = isHidden();
      if (hidden) {
        if (this.visible) {
          this.visible = false;
          this.settings.onHide?.();
        }
        return;
      }
      if (!this.visible) {
        this.visible = true;
        this.settings.onShow?.();
      }
      // Elapsed check (#29): background/sleep time counts as inactivity.
      // Mobile browsers freeze timers while hidden; compare wall clock on return.
      const elapsed = Date.now() - this.lastActive;
      if (elapsed >= this.settings.idle && !this.idle) {
        this.idle = true;
        this.settings.onIdle?.();
        if (!this.settings.keepTracking) {
          this.clearTimer();
          return;
        }
      }
      this.rearm();
    };
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      if (this.isInterval) clearInterval(this.timerId as ReturnType<typeof setInterval>);
      else clearTimeout(this.timerId as ReturnType<typeof setTimeout>);
      this.timerId = null;
    }
  }

  private arm(): void {
    this.clearTimer();
    if (this.settings.recurIdleCall) {
      this.isInterval = true;
      this.timerId = setInterval(() => {
        this.idle = true;
        this.settings.onIdle?.();
      }, this.settings.idle);
    } else {
      this.isInterval = false;
      this.timerId = setTimeout(() => {
        this.idle = true;
        this.settings.onIdle?.();
      }, this.settings.idle);
    }
  }

  private rearm(): void {
    this.clearTimer();
    if (this.settings.keepTracking) this.arm();
  }

  /** @deprecated Use `rearm` semantics via `reset()` + running state. Kept for v1 compat. */
  resetTimeout(_settings?: unknown, keepTracking: boolean = this.settings.keepTracking): void {
    this.clearTimer();
    if (keepTracking) this.arm();
  }

  /** @deprecated Use `arm()` internally. Kept for v1 compat. */
  timeout(_settings?: unknown): void {
    this.arm();
  }

  start(): this {
    if (typeof window === "undefined" && !this.settings.target) return this; // SSR no-op
    if (this.started) return this;
    this.started = true;
    const target =
      resolveTarget(this.settings.target) ?? (typeof window !== "undefined" ? window : null);
    this.settings.target = target;
    if (target) {
      target.addEventListener("idle:stop", this.stopListener as EventListener);
      for (const event of this.settings.events) {
        // capture:true fixes #26 (scroll does not bubble); passive:true keeps scroll fast
        target.addEventListener(
          event,
          this.activityHandler as EventListener,
          { capture: event === "scroll", passive: true } as AddEventListenerOptions,
        );
      }
    }
    if (typeof document !== "undefined" && (this.settings.onShow || this.settings.onHide || true)) {
      // Always track visibility so background elapsed time works (#29), even without callbacks.
      for (const event of VISIBILITY_EVENTS) {
        document.addEventListener(
          event,
          this.visibilityHandler as EventListener,
          { passive: true } as AddEventListenerOptions,
        );
      }
    }
    // If constructed with startAtIdle:false and never active yet, arm now.
    // If startAtIdle:true, still arm so first activity can deactivate.
    this.rearm();
    return this;
  }

  stop(): this {
    const target = this.settings.target;
    if (target) {
      target.removeEventListener("idle:stop", this.stopListener as EventListener);
      for (const event of this.settings.events) {
        target.removeEventListener(
          event,
          this.activityHandler as EventListener,
          { capture: event === "scroll" } as EventListenerOptions,
        );
      }
    }
    if (typeof document !== "undefined") {
      for (const event of VISIBILITY_EVENTS) {
        document.removeEventListener(event, this.visibilityHandler as EventListener);
      }
    }
    this.clearTimer();
    this.started = false;
    return this;
  }

  reset(options: { idle?: boolean; visible?: boolean } = {}): this {
    const { idle = this.settings.startAtIdle, visible = !this.settings.startAtIdle } = options;
    this.idle = idle;
    this.visible = visible;
    if (!idle) this.lastActive = Date.now();
    return this;
  }

  throwOnBadKey(keys: string[], goodKeys: string[]): void {
    for (const key of keys) {
      if (!goodKeys.includes(key)) throw new Error(`IdleJs: unknown option "${key}"`);
    }
  }

  set(options: Partial<IdleOptions>): void {
    this.throwOnBadKey(Object.keys(options), [...Object.keys(DEFAULTS), "target"]);
    const wasRunning = this.started;
    Object.assign(this.settings, options);
    if (options.events) this.settings.events = [...options.events];
    if (
      wasRunning &&
      (options.idle !== undefined ||
        options.events !== undefined ||
        options.keepTracking !== undefined)
    ) {
      this.reattach();
    }
  }

  private reattach(): void {
    const target = this.settings.target;
    if (target) {
      for (const event of this.settings.events) {
        try {
          target.removeEventListener(
            event,
            this.activityHandler as EventListener,
            { capture: event === "scroll" } as EventListenerOptions,
          );
        } catch {
          /* noop */
        }
      }
      for (const event of this.settings.events) {
        target.addEventListener(
          event,
          this.activityHandler as EventListener,
          { capture: event === "scroll", passive: true } as AddEventListenerOptions,
        );
      }
    }
    this.rearm();
  }
}
