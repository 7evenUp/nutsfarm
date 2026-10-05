import React from "react"
import * as DialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/cn"

const AlertModal = DialogPrimitive.Root
const AlertModalTrigger = DialogPrimitive.Trigger
const AlertModalPortal = DialogPrimitive.Portal
const AlertModalClose = DialogPrimitive.Action
const AlertModalTitle = DialogPrimitive.Title
const AlertModalDescription = DialogPrimitive.Description

const AlertModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#300145]/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
AlertModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const AlertModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AlertModalPortal container={document.getElementById("dialogs")}>
    <AlertModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-[#191563] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F0F2FF] to-[#D0CEFB] font-nunito text-[#050D12] outline-none data-[state=open]:animate-content-show data-[state=open]:duration-500",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </AlertModalPortal>
))
AlertModalContent.displayName = DialogPrimitive.Content.displayName

export {
  AlertModal,
  AlertModalPortal,
  AlertModalOverlay,
  AlertModalClose,
  AlertModalTrigger,
  AlertModalContent,
  AlertModalTitle,
  AlertModalDescription,
}
