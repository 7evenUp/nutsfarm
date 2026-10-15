// A real mobile viewport keeps existing viewport units, responsive layouts,
// fixed navigation and portals together inside the phone screen.
if (window.frameElement?.hasAttribute("data-phone-screen")) {
  void import("./main")
} else {
  void import("./phone-preview")
}

export {}
