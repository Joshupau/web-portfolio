import Image from "next/image"
import BottomToTop from "./animated/bottom-to-top"


function Myimage() {
  return (
    <BottomToTop>
      <div className=" w-[60rem] h-full">
        <Image
          width={4000}
          height={4000}
          src='/3portfolio.png'
          alt="Picture of the author"
         className="w-full h-full object-cover"
        />
      </div>
    </BottomToTop>
  )
}

export default Myimage