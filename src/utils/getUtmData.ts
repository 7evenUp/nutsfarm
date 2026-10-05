export const getUtmData = () => {
  let isUtmPresent = false

  const { start_param } = Telegram.WebApp.initDataUnsafe

  const utm_data = {
    utm_medium: "",
    utm_source: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  }

  if (start_param) {
    const startParams = start_param.split("-")

    const utm_medium = startParams.find((param) =>
      param.startsWith("utmMedium"),
    )
    const utm_source = startParams.find((param) =>
      param.startsWith("utmSource"),
    )
    const utm_campaign = startParams.find((param) =>
      param.startsWith("utmCampaign"),
    )
    const utm_term = startParams.find((param) => param.startsWith("utmTerm"))
    const utm_content = startParams.find((param) =>
      param.startsWith("utmContent"),
    )

    if (utm_medium) {
      utm_data.utm_medium = utm_medium.split("_")[1]
      isUtmPresent = true
    }
    if (utm_source) {
      utm_data.utm_source = utm_source.split("_")[1]
      isUtmPresent = true
    }
    if (utm_campaign) {
      utm_data.utm_campaign = utm_campaign.split("_")[1]
      isUtmPresent = true
    }
    if (utm_term) {
      utm_data.utm_term = utm_term.split("_")[1]
      isUtmPresent = true
    }
    if (utm_content) {
      utm_data.utm_content = utm_content.split("_")[1]
      isUtmPresent = true
    }

    if (isUtmPresent) return utm_data

    return false
  } else {
    const url = new URL(location.href)
    const utm_medium = url.searchParams.get("utmMedium")
    const utm_source = url.searchParams.get("utmSource")
    const utm_campaign = url.searchParams.get("utmCampaign")
    const utm_term = url.searchParams.get("utmTerm")
    const utm_content = url.searchParams.get("utmContent")

    if (utm_medium) {
      utm_data.utm_medium = utm_medium
      isUtmPresent = true
    }
    if (utm_source) {
      utm_data.utm_source = utm_source
      isUtmPresent = true
    }
    if (utm_campaign) {
      utm_data.utm_campaign = utm_campaign
      isUtmPresent = true
    }
    if (utm_term) {
      utm_data.utm_term = utm_term
      isUtmPresent = true
    }
    if (utm_content) {
      utm_data.utm_content = utm_content
      isUtmPresent = true
    }

    if (isUtmPresent) return utm_data

    return false
  }

  return false
}
