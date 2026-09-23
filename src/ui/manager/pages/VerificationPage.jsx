import React, { useContext } from "react";
import VerificationCard from "../components/VerificationCard";
import { context } from "../../../context/context";
import { ShieldCheck, Inbox } from "lucide-react";

function VerificationPage() {
  const { verificationStatus } = useContext(context);
  console.log("verificationStatus in VerificationPage:", verificationStatus);

  // Manager Approve Handler
  const handleApprove = (record) => {
    console.log("Approve Verification ID:", record._id);
    // API Call: await api.post(`/verify/approve/${record._id}`);
  };

  // Manager Reject Handler
  const handleReject = (record) => {
    console.log("Reject Verification ID:", record._id);
    // API Call: await api.post(`/verify/reject/${record._id}`);
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8">
      
      {/* PAGE HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Work Verification Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and audit field worker check-in and check-out submission proofs.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT LAYOUT / EMPTY STATE */}
      <div className="max-w-5xl mx-auto">
        {verificationStatus && verificationStatus.length > 0 ? (
          /* FIXED: Single column layout per row (Max 2 on 2K screens) so card width stays wide and airy */
          <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {verificationStatus.map((item) => (
              <VerificationCard
                key={item._id}
                verificationData={item}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE CARD */
          <div className="w-full max-w-md mx-auto mt-12 bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500 mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              No Verifications Available
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              There are currently no active worker check-in or check-out records waiting for review.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default VerificationPage;