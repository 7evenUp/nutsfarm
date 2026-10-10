import { useState } from "react"

import Root from "./Root"
import ChangeAvatar from "./ChangeAvatar"

import { sendMetrika } from "@/utils/sendMetrika"

const ProfileDialog = ({ children }: { children: React.ReactNode }) => {
  const [rootOpen, setRootOpened] = useState(false)
  const [changeAvatarOpen, setChangeAvatarOpened] = useState(false)

  const openRoot = () => setRootOpened(true)
  const closeRoot = () => setRootOpened(false)
  const openChangeAvatar = () => setChangeAvatarOpened(true)
  const closeChangeAvatar = () => setChangeAvatarOpened(false)

  return (
    <>
      <button
        className="flex items-center gap-2"
        onClick={() => {
          sendMetrika("profile")

          openRoot()
        }}
      >
        {children}
      </button>

      <Root
        open={rootOpen}
        setOpen={setRootOpened}
        close={closeRoot}
        openChangeAvatar={openChangeAvatar}
      />

      <ChangeAvatar
        open={changeAvatarOpen}
        setOpen={setChangeAvatarOpened}
        close={closeChangeAvatar}
        openRoot={openRoot}
      />
    </>
  )
}

export default ProfileDialog
