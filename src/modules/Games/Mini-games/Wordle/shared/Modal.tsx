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
      "fixed inset-0 z-50 bg-[#392382]/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal container={document.getElementById("dialogs")}>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFFFF] to-[#ECF2FF] font-nunito text-white outline-none data-[state=open]:animate-content-show data-[state=open]:duration-500",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = DialogPrimitive.Content.displayName

const ModalHeader = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "flex -translate-y-px items-center justify-center rounded-t-2xl border border-[#6D50CC] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#8FB5FC] to-[#7B67F4] py-4",
      className,
    )}
  >
    <h2 className="bg-gradient-to-b from-[#FFFFFF] to-[#F0F4FF] bg-clip-text font-days-one text-3xl/8 text-transparent drop-shadow-[0px_2px_2px_rgba(47,40,82,0.3)]">
      {children}
    </h2>
  </div>
)

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalHeader,
}
