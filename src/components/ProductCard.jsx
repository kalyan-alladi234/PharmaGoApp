import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAdd = () => {
    const ok = addToCart(product);
    if (!ok) navigate('/login');
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.brand}</p>
      <p className="mt-2 font-semibold">₹{product.price}</p>
      <button
        onClick={handleAdd}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
