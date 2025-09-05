"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface KtpDisplayProps {
	ktpUrl: string;
	customerName: string;
}

export function KtpDisplay({ ktpUrl, customerName }: KtpDisplayProps) {
	const [isBlurred, setIsBlurred] = useState(true);

	const handleImageClick = () => {
		setIsBlurred((prev) => !prev);
	};

	return (
		<div>
			<div
				onClick={handleImageClick}
				className="relative w-full overflow-hidden border rounded-md cursor-pointer aspect-video group"
				title={
					isBlurred ? "Klik untuk melihat gambar" : "Klik untuk menyembunyikan"
				}
			>
				<Image
					src={ktpUrl}
					alt={`Foto KTP ${customerName}`}
					layout="fill"
					objectFit="contain"
					className={cn(
						"transition-all duration-300 ease-in-out",
						isBlurred && "blur-lg scale-105"
					)}
				/>

				{isBlurred && (
					<div className="absolute inset-0 flex flex-col items-center justify-center transition-colors bg-black/50 group-hover:bg-black/30">
						<Eye className="w-8 h-8 text-white/80" />
						<p className="mt-2 text-sm font-semibold text-white/90">
							Klik untuk Melihat
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
