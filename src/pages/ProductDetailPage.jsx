import { useParams } from "react-router-dom";

function ProductDetailPage() {
  const { id } = useParams();
  return <h1>Medicine Details for ID: {id}</h1>;
}
export default ProductDetailPage;
