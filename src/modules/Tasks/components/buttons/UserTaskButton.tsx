import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import LoaderIcon from "@/assets/icons/loader.svg?react"
import CoinPng from "@/assets/images/coin.png"
import ClockIcon from "@/assets/icons/clock.svg?react"

import CryptonOnboardingDialog from "@/modals/CryptonOnboarding"
import UserAnswerDialog from "@/modals/UserAnswer"

import { XP_PER_LEVEL } from "@/modules/NutsPassV2/constants"

import { Button } from "@/shared/ui/Button"

import { useAppSelector } from "@/redux/hooks"
import { useClaimTaskMutation, useGetCurrentTasksQuery } from "@/redux/api/task"
import { useGetCurrentUserQuery, useGetReferralsQuery } from "@/redux/api/user"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { UserTask as IUserTask, TaskType } from "@/types/task"

import { cn } from "@/lib/cn"

const DEFAULT_PAGINATION_SIZE = 15

const UserTaskButton = ({
  id,
  status,
  telegramChannelId,
  translationTelegramChannelId,
  referralsCountGoal,
  link,
  title,
  description,
  type,
  appearance,
  onManualChecking,
  executionIntervalDays,
  executionIntervalHours,
  lastExecutionDate,
  lastExecutionDateTime,
  value,
  className,
}: Pick<
  IUserTask,
  | "id"
  | "status"
  | "telegramChannelId"
  | "translationTelegramChannelId"
  | "referralsCountGoal"
  | "link"
  | "title"
  | "description"
  | "type"
  | "onManualChecking"
  | "executionIntervalDays"
  | "executionIntervalHours"
  | "lastExecutionDate"
  | "lastExecutionDateTime"
  | "value"
> & {
  isClaimed?: boolean
  className?: string
  appearance: "yellow-linear" | "white"
}) => {
  const { t } = useTranslation()

  const page = useAppSelector((state) => state.refPageNumber.value)
  const lang = useAppSelector((state) => state.language.value)

  const [isClaimLocked, setIsClaimLocked] = useState(false)
  const [isSubmitLocked, setIsSubmitLocked] = useState(false)

  const [claimTask, { isLoading: isClaimLoading, isError: isClaimError }] =
    useClaimTaskMutation()
  const { refetch: refetchCurrentTasks } = useGetCurrentTasksQuery({ lang })
  const { data: referralInfo } = useGetReferralsQuery({
    page,
    size: DEFAULT_PAGINATION_SIZE,
  })
  const { data: currentUser } = useGetCurrentUserQuery()

  useEffect(() => {
    if (status !== "VERIFYING") return

    const timeoutId = setTimeout(() => {
      refetchCurrentTasks()
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [status])

  const makeToast = (points: number) => {
    toast(
      <div className="flex flex-wrap items-center font-bold">
        <img src={CoinPng} alt="Nuts coin icon" className="mr-2.5 h-10 w-10" />
        <span className="text-[#FED900]">+{numberWithSpaces(points)} NUTS</span>
      </div>,
      {
        className: "justify-center",
      },
    )
  }

  const onClaimClick = async (type: TaskType) => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    let payload: { userTaskId: string; type: TaskType; timezone?: string } = {
      userTaskId: id,
      type,
    }

    if (executionIntervalDays !== null || executionIntervalHours !== null) {
      payload = {
        ...payload,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }

    setTimeout(async () => {
      try {
        const task = await claimTask(payload).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)

          // @ts-expect-error RTKQ_NO_ERROR_TYPES
          if (error.data) {
            if (
              // @ts-expect-error RTKQ_NO_ERROR_TYPES
              error.data.includes(
                "A subscription verification request for this user has already been made recently",
              )
            ) {
              toast.error(t("Ошибка"), {
                description: t(
                  "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
                ),
              })
            } else {
              toast.error(t("Ошибка"), {
                description: t("Не исполнены условия выполнения задания"),
              })
            }
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onTgClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      const correctTg =
        telegramChannelId === null
          ? translationTelegramChannelId
          : telegramChannelId
      if (correctTg === null) return

      try {
        const task = await claimTask({
          userTaskId: id,
          type: "TELEGRAM_CHANNEL_SUBSCRIPTION",
          telegramChannelId: correctTg,
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)
          if (
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data &&
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data.includes(
              "A subscription verification request for this user has already been made recently",
            )
          ) {
            toast.error(t("Ошибка"), {
              description: t(
                "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
              ),
            })
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onLessonClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "LEARN_LESSON",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)

          if (
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data &&
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data.includes(
              "A subscription verification request for this user has already been made recently",
            )
          ) {
            toast.error(t("Ошибка"), {
              description: t(
                "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
              ),
            })
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onPartnerClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "PARTNER_SUBSCRIPTION",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)
          if (
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data &&
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data.includes(
              "A subscription verification request for this user has already been made recently",
            )
          ) {
            toast.error(t("Ошибка"), {
              description: t(
                "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
              ),
            })
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onVoteClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "APP_CENTER_VOTE",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)
          if (
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data &&
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data.includes(
              "A subscription verification request for this user has already been made recently",
            )
          ) {
            toast.error(t("Ошибка"), {
              description: t(
                "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
              ),
            })
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onSoulPartnerClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "SOUL_PARTNER_SUBSCRIPTION",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)
          if (
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data &&
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            error.data.includes(
              "A subscription verification request for this user has already been made recently",
            )
          ) {
            toast.error(t("Ошибка"), {
              description: t(
                "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
              ),
            })
          } else {
            toast.error(t("Ошибка"), {
              description: t("Условия не выполнены"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onRefClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return
    if (!referralsCountGoal) return
    if (!referralInfo) return
    if (referralInfo.total < referralsCountGoal) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "RECRUIT_REFERRALS",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch {
        setTimeout(() => {
          setIsClaimLocked(false)
          toast.error(t("Ошибка"), {
            description: t("Упс, что-то пошло не так"),
          })
        }, 500)
      }
    }, 2000)
  }

  const submitCryptonClaim = async (answer: string) => {
    if (isClaimLoading || isSubmitLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsSubmitLocked(true)

    try {
      await claimTask({
        userTaskId: id,
        cryptonOnboardingAnswer: answer,
        type: "CRYPTON_ONBOARDING",
      }).unwrap()
      toast(t("Вы ввели правильный ответ"), {
        className: "justify-center",
      })
    } catch {
      /* empty */
    } finally {
      setTimeout(() => setIsSubmitLocked(false), 1000)
    }
  }

  const submitUserAnswerClaim = async (answer: string) => {
    if (isClaimLoading || isSubmitLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsSubmitLocked(true)

    try {
      await claimTask({
        userTaskId: id,
        userAnswer: answer,
        type: "USER_ANSWER",
      }).unwrap()
      toast(t("Вы ввели правильный ответ"), {
        className: "justify-center",
      })
    } catch {
      /* empty */
    } finally {
      setTimeout(() => setIsSubmitLocked(false), 1000)
    }
  }

  const submitManualUserAnswerClaim = async (answer: string) => {
    if (isClaimLoading || isSubmitLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsSubmitLocked(true)

    try {
      await claimTask({
        userTaskId: id,
        userAnswer: answer,
        type: "MANUAL_USER_ANSWER",
      }).unwrap()
      toast(t("Вы ввели правильный ответ"), {
        className: "justify-center",
      })
    } catch {
      /* empty */
    } finally {
      setTimeout(() => setIsSubmitLocked(false), 1000)
    }
  }

  const submitManualUgcClaim = async (answer: string) => {
    if (isClaimLoading || isSubmitLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsSubmitLocked(true)

    try {
      await claimTask({
        userTaskId: id,
        userAnswer: answer,
        type: "MANUAL_UGC",
      }).unwrap()
      toast(t("Вы ввели правильный ответ"), {
        className: "justify-center",
      })
    } catch {
      /* empty */
    } finally {
      setTimeout(() => setIsSubmitLocked(false), 1000)
    }
  }

  const onFarmClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "FARM",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)

          // @ts-expect-error RTKQ_NO_ERROR_TYPES
          if (error.data) {
            if (
              // @ts-expect-error RTKQ_NO_ERROR_TYPES
              error.data.includes(
                "A subscription verification request for this user has already been made recently",
              )
            ) {
              toast.error(t("Ошибка"), {
                description: t(
                  "Запрос на проверку уже был отправлен. Пожалуйста, попробуйте позже",
                ),
              })
            }
            // @ts-expect-error RTKQ_NO_ERROR_TYPES
            else if (error.data.includes("Not enough farmings")) {
              toast.error(t("Ошибка"), {
                description: t("Не исполнены условия выполнения задания"),
              })
            } else {
              toast.error(t("Ошибка"), {
                description: t("Упс, что-то пошло не так"),
              })
            }
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onNotificationClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "NOTIFICATION",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)

          // @ts-expect-error RTKQ_NO_ERROR_TYPES
          if (error.data) {
            if (
              // @ts-expect-error RTKQ_NO_ERROR_TYPES
              error.data.includes("User hasn't notified any friend!")
            ) {
              toast.error(t("Ошибка"), {
                description: t(
                  "Необходимо отправить уведомление хотя бы одному другу!",
                ),
              })
            } else {
              toast.error(t("Ошибка"), {
                description: t("Упс, что-то пошло не так"),
              })
            }
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  const onPassPurchaseClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "NUT_PASS_PURCHASE",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch {
        setTimeout(() => {
          setIsClaimLocked(false)

          toast.error(t("Ошибка"), {
            description: t("Условия не выполнены"),
          })
        }, 500)
      }
    }, 2000)
  }

  const onReceiveNFTClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "RECEIVE_NFT",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch {
        setTimeout(() => {
          setIsClaimLocked(false)

          toast.error(t("Ошибка"), {
            description: t("Условия не выполнены"),
          })
        }, 500)
      }
    }, 2000)
  }

  const onGameClaimClick = (type: TaskType) => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type,
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch {
        setTimeout(() => {
          setIsClaimLocked(false)

          toast.error(t("Ошибка"), {
            description: t("Условия не выполнены"),
          })
        }, 500)
      }
    }, 2000)
  }

  const onReachPassLvlClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "NUT_PASS_REACH_LEVEL",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch {
        setTimeout(() => {
          setIsClaimLocked(false)

          toast.error(t("Ошибка"), {
            description: t("Условия не выполнены"),
          })
        }, 500)
      }
    }, 2000)
  }

  const onAllFriendsNotificationClaimClick = () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    setTimeout(async () => {
      try {
        const task = await claimTask({
          userTaskId: id,
          type: "ALL_FRIENDS_NOTIFICATION",
        }).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            setIsClaimLocked(false)
            makeToast(task.task.reward)
          }, 500)
        }
      } catch (error) {
        setTimeout(() => {
          setIsClaimLocked(false)

          // @ts-expect-error RTKQ_NO_ERROR_TYPES
          if (error.data) {
            if (
              // @ts-expect-error RTKQ_NO_ERROR_TYPES
              error.data.includes("User hasn't notified all friends!")
            ) {
              toast.error(t("Ошибка"), {
                description: t(
                  "Необходимо отправить уведомление всем своим друзьям!",
                ),
              })
            } else {
              toast.error(t("Ошибка"), {
                description: t("Упс, что-то пошло не так"),
              })
            }
          } else {
            toast.error(t("Ошибка"), {
              description: t("Упс, что-то пошло не так"),
            })
          }
        }, 500)
      }
    }, 2000)
  }

  if (status === "PENDING") {
    if (type === "CRYPTON_ONBOARDING")
      return (
        <CryptonOnboardingDialog
          title={title}
          description={description}
          onClick={submitCryptonClaim}
          link={link}
          isError={isClaimError}
          isLoading={isClaimLoading}
        >
          <Button appearance={appearance} className={cn("ml-auto", className)}>
            {t("Завершить")}
          </Button>
        </CryptonOnboardingDialog>
      )

    if (type === "USER_ANSWER")
      return (
        <UserAnswerDialog
          title={title}
          description={description}
          onClick={submitUserAnswerClaim}
          isError={isClaimError}
        >
          <Button appearance={appearance} className={cn("ml-auto", className)}>
            {t("Завершить")}
          </Button>
        </UserAnswerDialog>
      )

    if (type === "MANUAL_USER_ANSWER")
      return (
        <UserAnswerDialog
          title={title}
          description={description}
          onClick={submitManualUserAnswerClaim}
          isError={isClaimError}
        >
          <Button appearance={appearance} className={cn("ml-auto", className)}>
            {t("Завершить")}
          </Button>
        </UserAnswerDialog>
      )
    if (type === "MANUAL_UGC")
      return (
        <UserAnswerDialog
          title={title}
          description={description}
          onClick={submitManualUgcClaim}
          isError={isClaimError}
        >
          <Button appearance={appearance} className={cn("ml-auto", className)}>
            {t("Завершить")}
          </Button>
        </UserAnswerDialog>
      )

    if (type === "TELEGRAM_CHANNEL_SUBSCRIPTION")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onTgClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "PARTNER_SUBSCRIPTION")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onPartnerClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "APP_CENTER_VOTE")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onVoteClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "SOUL_PARTNER_SUBSCRIPTION")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onSoulPartnerClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "NUT_PASS_PURCHASE")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onPassPurchaseClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "RECEIVE_NFT")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onReceiveNFTClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (
      type === "CRYPTLE_WIN_IN_N_STEPS" ||
      type === "CRYPTLE_USE_HINT" ||
      type === "SPIN_WHEEL_WIN_NFT" ||
      type === "SPIN_WHEEL_WIN_JACKPOT"
    )
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={() => onGameClaimClick(type)}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "NUT_PASS_REACH_LEVEL") {
      if (value && currentUser) {
        if (Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) + 1 < value)
          return (
            <Button
              appearance={appearance}
              className={cn("ml-auto text-nowrap", className)}
              disabled
            >
              {Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) + 1} /{" "}
              {value}
            </Button>
          )
      }
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onReachPassLvlClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )
    }

    if (type === "RECRUIT_REFERRALS") {
      if (
        referralInfo &&
        referralsCountGoal &&
        referralInfo.total < referralsCountGoal
      )
        return (
          <Button
            appearance={appearance}
            className={cn("ml-auto", className)}
            disabled
          >
            {referralInfo?.total} / {referralsCountGoal}
          </Button>
        )

      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onRefClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )
    }

    if (type === "LEARN_LESSON") {
      return (
        <Button
          className={cn("ml-auto", className)}
          onClick={onLessonClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )
    }

    if (type === "FARM")
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onFarmClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )

    if (type === "NOTIFICATION") {
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onNotificationClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )
    }

    if (type === "ALL_FRIENDS_NOTIFICATION") {
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          onClick={onAllFriendsNotificationClaimClick}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Завершить")
          )}
        </Button>
      )
    }

    if (executionIntervalDays !== null) {
      const intervalMillis = executionIntervalDays * 24 * 60 * 60 * 1000
      const isDisabled = lastExecutionDate
        ? +new Date(lastExecutionDate) + intervalMillis > new Date().getTime()
        : false

      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto shrink-0", className)}
          onClick={() => onClaimClick(type)}
          disabled={isDisabled}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : isDisabled ? (
            t("Завершено")
          ) : (
            "Завершить"
          )}
        </Button>
      )
    }

    if (executionIntervalHours !== null) {
      const intervalMillis = executionIntervalHours * 60 * 60 * 1000
      const isDisabled = lastExecutionDateTime
        ? +new Date(lastExecutionDateTime) + intervalMillis >
          new Date().getTime()
        : false

      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto shrink-0", className)}
          onClick={() => onClaimClick(type)}
          disabled={isDisabled}
        >
          {isClaimLoading || isClaimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : isDisabled ? (
            t("Завершено")
          ) : (
            "Завершить"
          )}
        </Button>
      )
    }

    return (
      <Button
        appearance={appearance}
        className={cn("ml-auto", className)}
        onClick={() => onClaimClick(type)}
      >
        {isClaimLoading || isClaimLocked ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : (
          t("Завершить")
        )}
      </Button>
    )

    // return (
    //   <Button
    //     appearance={appearance}
    //     className={cn("ml-auto", className)}
    //     disabled
    //   >
    //     {t("Недоступно")}
    //   </Button>
    // )
  }

  if (status === "VERIFYING") {
    if (onManualChecking) {
      return (
        <Button
          appearance={appearance}
          className={cn("ml-auto", className)}
          disabled
        >
          <ClockIcon className="h-4 w-4" />
        </Button>
      )
    }

    return (
      <Button
        appearance={appearance}
        className={cn("ml-auto", className)}
        disabled
      >
        <LoaderIcon className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (executionIntervalDays !== null) {
    const intervalMillis = executionIntervalDays * 24 * 60 * 60 * 1000
    const isDisabled = lastExecutionDate
      ? +new Date(lastExecutionDate) + intervalMillis > new Date().getTime()
      : false

    return (
      <Button
        appearance={appearance}
        className={cn("ml-auto shrink-0", className)}
        onClick={() => onClaimClick(type)}
        disabled={isDisabled}
      >
        {isClaimLoading || isClaimLocked ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : isDisabled ? (
          t("Завершено")
        ) : (
          "Завершить"
        )}
      </Button>
    )
  }

  if (executionIntervalHours !== null) {
    const intervalMillis = executionIntervalHours * 60 * 60 * 1000
    const isDisabled = lastExecutionDateTime
      ? +new Date(lastExecutionDateTime) + intervalMillis > new Date().getTime()
      : false

    return (
      <Button
        appearance={appearance}
        className={cn("ml-auto shrink-0", className)}
        onClick={() => onClaimClick(type)}
        disabled={isDisabled}
      >
        {isClaimLoading || isClaimLocked ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : isDisabled ? (
          t("Завершено")
        ) : (
          "Завершить"
        )}
      </Button>
    )
  }

  return (
    <Button
      appearance={appearance}
      className={cn("ml-auto", className)}
      onClick={() => onClaimClick(type)}
      disabled={status === "CLAIMED"}
    >
      {isClaimLoading || isClaimLocked ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : status === "CLAIMED" ? (
        t("Завершено")
      ) : (
        t("Завершить")
      )}
    </Button>
  )
}

export default UserTaskButton
