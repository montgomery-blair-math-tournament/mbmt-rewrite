"use client";
import { motion } from "motion/react";

export default function TitleCard() {
    return (
        <div className="bg-black flex-col gap-24 align-center justify-normal min-h-screen w-full p-48">
            <div className="text-6xl font-extrabold text-center">
                Montgomery Blair Math Tournament
            </div>

            <div className="text-center">
                A middle-school math competition intended for middle schoolers
                who attend middle school at a middle school.
            </div>
        </div>
    );
}
