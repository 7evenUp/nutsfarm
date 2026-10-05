import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import CloseIcon from "@/assets/icons/close.svg?react"

import { cn } from "@/lib/cn"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#09151D]/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal container={document.getElementById("dialogs")}>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "no-scroll fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-[14px] bg-[#050D12] p-4 pt-5 font-nunito text-white shadow-lg transition ease-in-out focus:outline-none data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        Telegram.WebApp.platform === "weba"
          ? "pb-8"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+16px)]",
        Telegram.WebApp.initData ? "h-screen" : "h-[100svh]",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  children,
  closeIconClassName,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  closeIconClassName?: string
}) => (
  <div
    className={cn(
      "flex min-h-7 shrink-0 items-center justify-center",
      className,
    )}
    {...props}
  >
    <DialogPrimitive.Title className="font-tt-hoves-expanded text-lg font-semibold tracking-[-0.02em] text-white">
      {children}
    </DialogPrimitive.Title>
    <DialogPrimitive.Close
      className={cn(
        "absolute right-4 ml-auto opacity-70 transition-opacity focus:outline-none active:opacity-100",
        closeIconClassName,
      )}
    >
      <CloseIcon className="h-6 w-6" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  </div>
)
DialogHeader.displayName = "DialogHeader"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
}
