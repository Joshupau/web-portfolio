import Image from "next/image";

export default function Frame({ src, alt, width, height, host }: { src: string; alt: string; width: number; height: number; host: string }) {
  return (
    <figure className="frame">
      <div className="frame__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{host}</span>
      </div>
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 900px) 100vw, 640px" />
    </figure>
  );
}
