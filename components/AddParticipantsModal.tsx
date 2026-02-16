"use client";

import Heading from "./Heading";
import ParticipantsTable from "./ParticipantsTable";
import Modal, { ModalButton } from "./ui/Modal";

export default function AddParticipantsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Participants"
            footer={
                <>
                    <ModalButton variant="primary" onClick={onClose}>
                        Cancel
                    </ModalButton>
                    <ModalButton variant="themed">Add</ModalButton>
                </>
            }>
            <div className="p-4 rounded-md shadow-sm">
                <Heading level={3} className="text-lg font-medium mb-4">
                    New Participants
                </Heading>
                <ParticipantsTable
                    participants={[]}
                    loading={false}
                    readonly={true}
                />
            </div>
        </Modal>
    );
}
