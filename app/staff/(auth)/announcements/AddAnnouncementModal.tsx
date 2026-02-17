import Modal, { ModalButton } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/server";
import { addAnnouncement } from "./actions";
import { useState } from "react";

export default function AddAnnouncementModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [author, setAuthor] = useState("");
    const [message, setMessage] = useState("");
    const [expiresAt, setExpiresAt] = useState(new Date());

    async function announce() {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const { data: roleData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user?.id)
            .limit(1)
            .single();

        if (roleData && roleData.role === "admin") {
            addAnnouncement({ author, message, expiresAt });
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Announcement"
            footer={
                <>
                    <ModalButton variant="primary" onClick={onClose}>
                        Cancel
                    </ModalButton>
                    <ModalButton variant="themed">Add Announcement</ModalButton>
                </>
            }>
            <input type="text" />
        </Modal>
    );
}
