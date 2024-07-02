import Image from "next/image"


function Myimage() {
  return (
    <div>
        <Image
        width={600}
        height={800}
        src='/portfolio.png'
        alt="Picture of the author"
        className="brightness-105"
        />
    </div>
  )
}

export default Myimage