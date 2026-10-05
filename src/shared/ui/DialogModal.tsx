import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/cn"

const DialogModal = DialogPrimitive.Root

const DialogModalTrigger = DialogPrimitive.Trigger

const DialogModalPortal = DialogPrimitive.Portal

const DialogModalClose = DialogPrimitive.Close

const DialogModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#2D3745]/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogModalPortal container={document.getElementById("dialogs")}>
    <DialogModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "no-scroll fixed inset-x-0 bottom-0 left-1/2 top-1/2 z-50 flex w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[18px] bg-[#213C50] p-[22px] pt-6 font-nunito text-white shadow-lg shadow-[#050D12]/60 transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        Telegram.WebApp.platform === "weba"
          ? "pb-[22px]"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+6px)]",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogModalPortal>
))
DialogModalContent.displayName = DialogPrimitive.Content.displayName

const DialogModalHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex min-h-7 items-center justify-center", className)}
    {...props}
  >
    <DialogPrimitive.Title className="w-[230px] text-center font-tt-hoves-expanded text-xl text-white">
      {children}
    </DialogPrimitive.Title>
  </div>
)
DialogModalHeader.displayName = "DialogHeader"

export {
  DialogModal,
  DialogModalPortal,
  DialogModalOverlay,
  DialogModalClose,
  DialogModalTrigger,
  DialogModalContent,
  DialogModalHeader,
}
