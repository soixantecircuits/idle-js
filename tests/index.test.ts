import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { IdleJs } from "../src/index.ts";

function makeTarget() {
  const listeners = new Map<string, Set<EventListener>>();
  return {
    listeners,
    addEventListener: (name: string, fn: EventListener) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(fn);
    },
    removeEventListener: (name: string, fn: EventListener) => {
      listeners.get(name)?.delete(fn);
    },
    fire: (name: string) => {
      listeners.get(name)?.forEach((fn) => (fn as () => void)());
    },
  };
}

describe("IdleJs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("fires onIdle after timeout, onActive on next event", () => {
    const target = makeTarget();
    let idleCalls = 0;
    let activeCalls = 0;
    const idle = new IdleJs({
      idle: 1000,
      events: ["mousemove"],
      onIdle: () => idleCalls++,
      onActive: () => activeCalls++,
      target: target as unknown as Window,
    });
    idle.start();
    expect(idle.idle).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(idle.idle).toBe(true);
    expect(idleCalls).toBe(1);
    target.fire("mousemove");
    expect(idle.idle).toBe(false);
    expect(activeCalls).toBe(1);
    idle.stop();
    vi.useRealTimers();
  });

  test("set({ idle }) re-arms the running timer (#19)", () => {
    const target = makeTarget();
    let idleCalls = 0;
    const idle = new IdleJs({
      idle: 10000,
      events: ["mousemove"],
      onIdle: () => idleCalls++,
      target: target as unknown as Window,
    });
    idle.start();
    vi.advanceTimersByTime(9000);
    idle.set({ idle: 500 });
    vi.advanceTimersByTime(500);
    expect(idleCalls).toBe(1);
    idle.stop();
    vi.useRealTimers();
  });

  test("startAtIdle:false default; reset() restores initial state", () => {
    const idle = new IdleJs({ idle: 1000 });
    expect(idle.idle).toBe(false);
    idle.reset({ idle: true });
    expect(idle.idle).toBe(true);
    idle.reset();
    expect(idle.idle).toBe(false);
  });

  test("stop() clears pending idle", () => {
    const target = makeTarget();
    let idleCalls = 0;
    const idle = new IdleJs({
      idle: 1000,
      events: [],
      onIdle: () => idleCalls++,
      target: target as unknown as Window,
    });
    idle.start();
    idle.stop();
    vi.advanceTimersByTime(5000);
    expect(idleCalls).toBe(0);
    vi.useRealTimers();
  });

  test("unknown option throws", () => {
    expect(() => new IdleJs({ nope: 1 } as never)).toThrow(/unknown option/);
  });

  test("elapsed check: lastActive exposed for visibility return (#29)", () => {
    const idle = new IdleJs({ idle: 1000 });
    expect(typeof idle.lastActive).toBe("number");
  });
});
