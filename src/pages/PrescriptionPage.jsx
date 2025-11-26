import PrescriptionUpload from "../components/PrescriptionUpload";

function PrescriptionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload Prescription</h1>
      <p className="text-gray-700 mb-4">
        Upload your doctor’s prescription to get it verified before checkout.
      </p>
      <PrescriptionUpload onUploaded={(url) => console.log("Uploaded:", url)} />
    </div>
  );
}

export default PrescriptionPage;
