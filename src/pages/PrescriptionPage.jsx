import PrescriptionUpload from "../components/PrescriptionUpload";
import PrescriptionList from "../components/PrescriptionList";
import ErrorBoundary from "../components/ErrorBoundary";

function PrescriptionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload Prescription</h1>
      <p className="text-gray-700 mb-4">
        Upload your doctor’s prescription to get it verified before checkout.
      </p>
      <ErrorBoundary>
        <PrescriptionUpload onUploaded={(url) => console.log("Uploaded:", url)} />
      </ErrorBoundary>
      <hr style={{ margin: "24px 0" }} />
      <ErrorBoundary>
        <PrescriptionList />
      </ErrorBoundary>
    </div>
  );
}

export default PrescriptionPage;
