// pages/dashboard/pagos.tsx
import React, { useState, useEffect } from 'react';
import PrivateLayout from '@/components/layout/PrivateLayout'; // Asegúrate de que esta ruta sea correcta

// Define la interfaz para un ítem en el carrito
interface CartItem {
  id: string;
  name: string;
  type: 'Curso' | 'Mentoría';
  price: number;
  quantity: number;
  image: string; // URL de la imagen del producto
}

// Datos de productos ficticios para el carrito (Cursos y Mentorías)
const initialCartItems: CartItem[] = [
  {
    id: 'course1',
    name: 'Master en Desarrollo Web Fullstack',
    type: 'Curso',
    price: 499.99,
    quantity: 1,
    image: 'https://placehold.co/100x100/AEC6CF/000000?text=Curso+Web'
  },
  {
    id: 'mentoria1',
    name: 'Mentoría Personalizada de Carrera Tech',
    type: 'Mentoría',
    price: 150.00,
    quantity: 1,
    image: 'https://placehold.co/100x100/FFDDC1/000000?text=Mentoría'
  },
  {
    id: 'course2',
    name: 'Introducción a la Inteligencia Artificial',
    type: 'Curso',
    price: 299.00,
    quantity: 2,
    image: 'https://placehold.co/100x100/B3E0FF/000000?text=Curso+IA'
  },
];

// Componente principal de la Página de Checkout (integrado en PagosPage)
const PagosPage: React.FC = () => {
  // Estados para la aplicación
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Lista de ítems en el carrito
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga simulado
  const [error, setError] = useState<string | null>(null); // Mensajes de error
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Mostrar modal de confirmación
  const [itemToRemove, setItemToRemove] = useState<string | null>(null); // ID del ítem a borrar

  // Simula la carga de datos iniciales
  useEffect(() => {
    setLoading(true);
    // Simula una llamada a la API con un retraso
    setTimeout(() => {
      setCartItems(initialCartItems);
      setLoading(false);
    }, 500); // 500ms de retraso para simular carga
  }, []); // Se ejecuta solo una vez al montar el componente

  // Calcula el subtotal de un ítem
  const calculateItemSubtotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  // Calcula el subtotal de todos los ítems en el carrito
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemSubtotal(item), 0);
  };

  // Calcula el costo de envío (ficticio)
  const calculateShipping = () => {
    return cartItems.length > 0 ? 0.00 : 0.00; // Envío gratis para cursos/mentorías
  };

  // Calcula el total final
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  // Maneja el cambio de cantidad de un ítem
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Evita cantidades menores a 1

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Función para mostrar el modal de confirmación antes de borrar
  const handleRemoveConfirm = (id: string) => {
    setItemToRemove(id);
    setShowConfirmModal(true);
  };

  // Función para eliminar un ítem del carrito
  const handleRemoveItem = () => {
    if (!itemToRemove) {
      setShowConfirmModal(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowConfirmModal(false); // Cerrar el modal

    setTimeout(() => { // Simula una operación asíncrona
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemToRemove));
      setItemToRemove(null); // Limpiar ID de borrado
      setLoading(false);
    }, 300);
  };

  // Simula el proceso de proceder al pago final
  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      setError("Tu carrito está vacío. ¡Añade algunos productos antes de proceder al pago!");
      return;
    }
    // En un entorno real, aquí se enviaría la información del pedido y se redirigiría a una pasarela de pago.
    alert("¡Procediendo al pago! (Esta es una simulación. En un entorno real, irías a una pasarela de pago.)");
  };

  // Renderizado condicional: carga, error o contenido principal
  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="text-xl font-semibold">Cargando tu carrito de compras...</div>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter">
        {/* Navbar - Integrado directamente en el layout si PrivateLayout no lo maneja, o se puede omitir si PrivateLayout ya tiene uno */}


        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">
              Finalizar Compra
            </h1>

            {cartItems.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-10">
                Tu carrito está vacío. ¡Explora nuestros cursos y mentorías y añade algo!
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sección izquierda: Ítems en el carrito y detalles de envío/pago */}
                <div className="lg:col-span-2">
                  {/* Ítems en el Carrito */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                      1. Productos en tu Carrito
                    </h2>
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center py-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover mr-4 shadow-sm"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=No+Image'; }}
                          />
                          <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.type}</p>
                            <p className="text-md font-medium text-gray-800 dark:text-gray-200">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mr-4">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">Cantidad</label>
                            <input
                              type="number"
                              id={`quantity-${item.id}`}
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-center"
                            />
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 w-24 text-right">
                            ${calculateItemSubtotal(item).toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveConfirm(item.id)}
                            className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección de Dirección de Envío (simulada) */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                      2. Dirección de Envío
                    </h2>
                    <div className="text-gray-700 dark:text-gray-300">
                      <p className="mb-2">Nombre Apellido</p>
                      <p className="mb-2">Calle Ficticia #123</p>
                      <p className="mb-2">Colonia Ejemplo, Ciudad Ficticia, CP 12345</p>
                      <p className="mb-2">País Ficticio</p>
                      <button className="text-blue-600 hover:underline dark:text-blue-400">
                        Cambiar dirección
                      </button>
                    </div>
                  </div>

                  {/* Sección de Método de Pago (simulada) */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                      3. Método de Pago
                    </h2>
                    <div className="text-gray-700 dark:text-gray-300">
                      <p className="mb-2">Tarjeta de Crédito terminada en **** 1234</p>
                      <p className="mb-2">Exp. 12/28</p>
                      <button className="text-blue-600 hover:underline dark:text-blue-400">
                        Cambiar método de pago
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sección derecha: Resumen del Pedido */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                      Resumen del Pedido
                    </h2>
                    <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}):</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío y Gestión:</span>
                        <span>${calculateShipping().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 border-t pt-3 border-gray-300 dark:border-gray-600">
                        <span>Total del pedido:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                      disabled={loading || cartItems.length === 0}
                    >
                      Proceder al Pago
                    </button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                      Al hacer tu pedido, aceptas nuestros Términos y Condiciones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    ¿Estás seguro de que quieres eliminar este producto del carrito?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-md transition duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRemoveItem}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default PagosPage;
