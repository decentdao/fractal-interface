import { ReactNode } from "react"

const ContentBoxTitle = ({
    children
}:{
    children:ReactNode
}) => {
  return (
    <p className="text-left text-md text-mediumGray">{children}</p>
  )
}

export default ContentBoxTitle