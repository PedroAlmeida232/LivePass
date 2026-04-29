import "@testing-library/jest-dom";
import React from "react";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder (required by otplib in JSDOM)
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock otplib globally to prevent ESM parsing errors in Jest
jest.mock("otplib", () => ({
  authenticator: {
    generate: jest.fn(() => "000000"),
    check: jest.fn(() => true),
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to render children directly without animations
jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        // Return a component that renders the given HTML element, filtering out framer-motion props
        const component = React.forwardRef(
          (
            {
              children,
              initial,
              animate,
              exit,
              variants,
              whileTap,
              whileHover,
              whileInView,
              whileFocus,
              whileDrag,
              onAnimationComplete,
              onAnimationStart,
              layout,
              layoutId,
              transition,
              viewport,
              ...htmlProps
            }: Record<string, unknown> & { children?: React.ReactNode },
            ref: React.Ref<HTMLElement>
          ) => {
            return React.createElement(
              prop,
              { ...htmlProps, ref },
              children
            );
          }
        );
        component.displayName = `motion.${prop}`;
        return component;
      },
    }
  ),
}));
