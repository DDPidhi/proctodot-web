import React, { useState } from "react";
import { CheckCircle, Mic, XCircle, Copy } from 'lucide-react';
import ApproveModal from "@/app/components/ApprovalModal";
import RejectModal from "@/app/components/RejectModal";
import ApprovalModal from "@/app/components/ApprovalModal";

interface ParticipantInfoBoxProps {
    name: string;
    message: string;
}

const rejectionReasons = [
    "-- seleziona un valore --",
    "Mancato rispetto dei requisiti tecnici per la partecipazione all'esame (assenza del sistema di esami IDCERT, connessione internet non adeguata, dispositivi richiesti assenti)",
    "Identità non verificabile o documentazione insufficiente",
    "Il candidato non corrisponde ai dati forniti durante la registrazione",
    "Violazione delle norme d'esame (es. utilizzo di materiale non autorizzato, comunicazione con terzi)",
    "Comportamento scorretto o mancato rispetto delle istruzioni del Proctor",
    "Ambiente non conforme ai requisiti d'esame (es. presenza di altre persone, rumori eccessivi, interruzioni frequenti)",
    "Problemi tecnici irrisolvibili che impediscono il corretto svolgimento dell'esame",
    "Rifiuto del candidato a seguire le istruzioni del Proctor",
    "Uso di dispositivi non autorizzati o software non consentito",
    "Tentativo di frode o manipolazione del processo d'esame",
];

const ParticipantInfoBox: React.FC<ParticipantInfoBoxProps> = ({ name, message }) => {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState(rejectionReasons[0]);

    return (
        <>
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 w-[90%] z-20">
                <div className="flex flex-col justify-between items-start">
                    <p className="font-semibold text-black">{name}</p>
                    <div className="flex justify-between w-full">
                        <p className="text-gray-600">{message}</p>
                        <button className="text-gray-500 hover:text-gray-800">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="w-full h-[1px] bg-neutral-300 mt-2" />
                </div>
                <div className="flex justify-end gap-2">
                    <button className="bg-green-100 p-1 rounded-full text-green-600 hover:bg-green-200" onClick={() => setShowApproveModal(true)}>
                        <CheckCircle className="w-5 h-5" />
                    </button>
                    <button className="bg-blue-100 p-1 rounded-full text-blue-600 hover:bg-blue-200">
                        <Mic className="w-5 h-5" />
                    </button>
                    <button className="bg-red-100 p-1 rounded-full text-red-600 hover:bg-red-200" onClick={() => setShowRejectModal(true)}>
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {showApproveModal && (
                <ApprovalModal name={name} onClose={() => setShowApproveModal(false)} />
            )}
            {showRejectModal && (
                <RejectModal
                    name={name}
                    selectedReason={selectedReason}
                    onSelect={setSelectedReason}
                    onClose={() => setShowRejectModal(false)}
                    onReject={() => {
                        setShowRejectModal(false);
                    }}
                    reasons={rejectionReasons}
                />
            )}
        </>
    );
};

export default ParticipantInfoBox;
