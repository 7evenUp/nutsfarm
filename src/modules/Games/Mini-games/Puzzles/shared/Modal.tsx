import React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/cn"

const Modal = DialogPrimitive.Root
const ModalTrigger = DialogPrimitive.Trigger
const ModalPortal = DialogPrimitive.Portal
const ModalClose = DialogPrimitive.Close
const ModalTitle = DialogPrimitive.Title
const ModalDescription = DialogPrimitive.Description

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#167255]/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    innerClassName?: string
  }
>(({ className, innerClassName, children, ...props }, ref) => (
  <ModalPortal container={document.getElementById("dialogs")}>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-[#532C04] bg-puzzles-modal bg-cover bg-no-repeat p-2 font-nunito text-[#050D12] outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] data-[state=open]:animate-content-show data-[state=open]:duration-500",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-[10px] bg-[#773401]/40" />
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-[10px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#CD9965]/20 to-[#6A2F02]/60",
          innerClassName,
        )}
      >
        {children}
      </div>
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = DialogPrimitive.Content.displayName

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
}
