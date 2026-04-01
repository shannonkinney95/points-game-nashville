"use client";

import Image from "next/image";

type Props = {
  name: string;
  photoUrl: string | null;
  emoji: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { container: "w-8 h-8", text: "text-lg", imgSize: 32 },
  md: { container: "w-12 h-12", text: "text-2xl", imgSize: 48 },
  lg: { container: "w-16 h-16", text: "text-3xl", imgSize: 64 },
};

export default function PlayerAvatar({
  name,
  photoUrl,
  emoji,
  size = "md",
}: Props) {
  const s = SIZES[size];

  if (photoUrl) {
    return (
      <div
        className={`${s.container} rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border-light`}
      >
        <Image
          src={photoUrl}
          alt={name}
          width={s.imgSize}
          height={s.imgSize}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} rounded-full bg-warm flex items-center justify-center ${s.text} flex-shrink-0`}
    >
      {emoji}
    </div>
  );
}
