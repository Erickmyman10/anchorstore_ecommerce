import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { formatNaira } from '../services/api';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
      <div className="w-24 h-24 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center p-2">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          : <div className="w-12 h-12 bg-gray-200 rounded" />}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.category || 'Category'}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-2 hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900">
              {formatNaira(item.price * item.quantity)}
            </span>
            <button
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
