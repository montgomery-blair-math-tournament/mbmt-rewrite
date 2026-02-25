"use client";

import HeaderButton from "@/components/HeaderButton";
import Heading from "@/components/Heading";
import { useState } from "react";
import { HiPlus } from "react-icons/hi2";
import AddAnnouncementModal from "./AddAnnouncementModal";

export default function AnnouncementsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <Heading level={1}>Announcements</Heading>
                    <HeaderButton
                        disabled={true}
                        onClick={() => setIsAddModalOpen(true)}>
                        <HiPlus className="w-4 h-4" /> Add
                    </HeaderButton>
                </div>
            </div>
            {/* 
            <AddAnnouncementModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            /> */}
        </>
    );
}
