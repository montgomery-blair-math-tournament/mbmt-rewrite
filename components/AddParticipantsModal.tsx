"use client";

import ParticipantsTable from "./ParticipantsTable";
import Modal from "./Modal";
import Button from "@/components/ui/Button";

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
                    <>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="bg-rose-800 hover:bg-rose-700 text-white">
                            Add
                        </Button>
                    </>
                </>
            }>
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium mb-4">New Participants</h3>
                <ParticipantsTable
                    participants={[]}
                    loading={false}
                    readonly={true}
                />
            </div>
        </Modal>
    );
}
