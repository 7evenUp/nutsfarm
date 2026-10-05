import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"

import CloseIcon from "@/assets/icons/close.svg?react"

import { cn } from "@/lib/cn"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-[#2D3745]/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "no-scroll fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-[14px] bg-[#050D12] p-4 pt-5 font-nunito text-white shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        Telegram.WebApp.platform === "weba"
          ? "pb-8"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+16px)]",
        className,
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  titleClassName,
  closeIconClassName,
  children,
  headerIcon,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  titleClassName?: string
  closeIconClassName?: string
  headerIcon?: React.ReactNode
}) => (
  <div
    className={cn(
      "flex min-h-7 shrink-0 items-center justify-center",
      className,
    )}
    {...props}
  >
    {headerIcon && headerIcon}
    <SheetPrimitive.Title
      className={cn(
        "font-tt-hoves-expanded text-lg font-semibold tracking-[-0.02em] text-white",
        titleClassName,
      )}
    >
      {children}
    </SheetPrimitive.Title>
    <SheetPrimitive.Close
      className={cn(
        "absolute right-4 ml-auto opacity-70 transition-opacity focus:outline-none active:opacity-100",
        closeIconClassName,
      )}
    >
      <CloseIcon className="h-6 w-6" />
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
  </div>
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-foreground text-lg font-semibold", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
