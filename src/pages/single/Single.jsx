import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Snackbar, Alert } from "@mui/material"; // Importar Snackbar y Alert

const Single = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Mensaje del Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Tipo de mensaje
  const [userOrders, setUserOrders] = useState([]); // Estado para pedidos
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const productsToShow = userProducts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const ordersToShow = userOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener datos del usuario
        const userDoc = doc(db, "userProfiles", userId);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.error("No se encontró el usuario");
        }

        // Obtener productos del proveedor
        const providerDoc = doc(db, "providerProducts", userId);
        const providerSnap = await getDoc(providerDoc);
        if (providerSnap.exists()) {
          setUserProducts(providerSnap.data().products || []);
        } else {
          console.error("No se encontraron productos para este usuario");
        }

        // Consultas para obtener pedidos como conductor o cliente
        const conductorQuery = query(collection(db, "pedidos"), where("conductorId", "==", userId));
        const conductorSnap = await getDocs(conductorQuery);
        const pedidosConductor = conductorSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().timestamp?.toDate().toLocaleString(), // Convertir Timestamp a string
        }));


        const clienteQuery = query(collection(db, "pedidos"), where("clienteId", "==", userId));
        const clienteSnap = await getDocs(clienteQuery);
        const pedidosCliente = clienteSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().timestamp?.toDate().toLocaleString(), // Convertir Timestamp a string
        }));

        // Combinar resultados y eliminar duplicados
        const allPedidos = [...pedidosConductor, ...pedidosCliente];
        const uniquePedidos = allPedidos.filter(
          (pedido, index, self) => index === self.findIndex((p) => p.id === pedido.id)
        );

        setUserOrders(uniquePedidos);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    fetchUserData();
  }, [userId, db]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsAddingProduct(false); // Asegurarse de que está en modo edición
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
    setIsAddingProduct(false); // Resetear al cerrar el modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => {
      const updatedProduct = { ...prev, [name]: value };
      // Actualizar campo "nombre" concatenando marca y formato
      if (name === "marca" || name === "formato") {
        updatedProduct.nombre = `${updatedProduct.marca || ""} - ${updatedProduct.formato || ""}`;
      }
      return updatedProduct;
    });
  };

  const handleSave = async () => {
  try {
    const updatedProduct = {
      ...selectedProduct,
      nombre: `${selectedProduct.marca} - ${selectedProduct.formato}`,
    };

    const providerDocRef = doc(db, "providerProducts", userId);
    const providerSnap = await getDoc(providerDocRef);

    if (providerSnap.exists()) {
      const productsList = providerSnap.data().products || [];
      const updatedProducts = productsList.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );

      await updateDoc(providerDocRef, { products: updatedProducts });
      setSnackbarMessage("Producto actualizado exitosamente!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setUserProducts(updatedProducts);
      handleCloseModal();
    } else {
      throw new Error("No se encontró el documento de proveedor.");
    }
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    setSnackbarMessage("Error al actualizar el producto.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAddProductClick = () => {
    setSelectedProduct({ marca: "", formato: "", precio: 0, stock: 0 });
    setIsAddingProduct(true);
    setOpenModal(true);
  };

 const handleAddNewProduct = async () => {
  try {
    const newProduct = {
      ...selectedProduct,
      nombre: `${selectedProduct.marca} - ${selectedProduct.formato}`,
      id: Date.now().toString(),
    };
    const providerDocRef = doc(db, "providerProducts", userId);
    const providerSnap = await getDoc(providerDocRef);

    if (providerSnap.exists()) {
      const productsList = providerSnap.data().products || [];
      const updatedProducts = [...productsList, newProduct];
      await updateDoc(providerDocRef, { products: updatedProducts });
      setSnackbarMessage("Producto agregado exitosamente!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setUserProducts(updatedProducts);
    } else {
      await updateDoc(providerDocRef, { products: [newProduct] });
      setSnackbarMessage("Producto agregado exitosamente!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setUserProducts([newProduct]);
    }
    handleCloseModal();
  } catch (error) {
    console.error("Error al agregar producto:", error);
    setSnackbarMessage("Error al agregar producto.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

const handleDeleteProduct = async (productId) => {
  if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      const providerDocRef = doc(db, "providerProducts", userId);
      const providerSnap = await getDoc(providerDocRef);

      if (providerSnap.exists()) {
        const updatedProducts = providerSnap.data().products.filter((product) => product.id !== productId);
        await updateDoc(providerDocRef, { products: updatedProducts });
        setSnackbarMessage("Producto eliminado exitosamente!");
        setSnackbarSeverity("success");
        setUserProducts(updatedProducts);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setSnackbarMessage("Error al eliminar producto.");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  }
};

const handleNextPage = () => {
  if (currentPage * rowsPerPage < userProducts.length) {
    setCurrentPage(currentPage + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};


  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <h1 className="title">Información</h1>
            {userData ? (
              <div className="item">
                <img
                  src={userData.profilePicture || "https://via.placeholder.com/150"}
                  alt=""
                  className="itemImg"
                />
                <div className="details">
                  <h1 className="itemTitle">{userData.firstName}</h1>
                  <div className="detailItem">
                    <span className="itemKey">Email:</span>
                    <span className="itemValue">{userData.email}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Teléfono:</span>
                    <span className="itemValue">{userData.phone}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Primer Nombre:</span>
                    <span className="itemValue">{userData.firstName}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Segundo Nombre:</span>
                    <span className="itemValue">{userData.lastName}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Tipo Usuario:</span>
                    <span className="itemValue">{userData.tipoUsuario}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>
        </div>
        
        <div className="bottom">
        <h1 className="title">Pedidos del Usuario</h1>
          {userOrders.length > 0 ? (
            <table className="productTable">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((order) => (
                   <tr key={order.id}>
                   <td>{order.id}</td>
                   <td>{order.fecha}</td> {/* Mostrar fecha legible */}
                   <td>{order.estado}</td>
                   <td>{order.precio}</td>
                 </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay pedidos para este usuario.</p>
          )}
        </div>
        {userData && userData.tipoUsuario === "proveedor" && (
        <div className="bottom">
          <h1 className="title">Productos del Usuario </h1>
          <button onClick={handleAddProductClick}>Agregar Producto</button>
          {userProducts.length > 0 ? (
            <table className="productTable">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Formato</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Nombre</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productsToShow.map((product, index) => (
                <tr key={index}>
                  <td>{product.marca}</td>
                  <td>{product.formato}</td>
                  <td>{product.precio}</td>
                  <td>{product.stock}</td>
                  <td>{product.nombre}</td>
                  <td>
                    <button onClick={() => handleEditClick(product)}>Editar</button>
                    <button onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <p>No hay productos disponibles para este usuario.</p>
          )}
          <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>Página {currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage * rowsPerPage >= userProducts.length}
          >
            Siguiente
          </button>
        </div>
        </div>
      )}
      </div>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal para editar el producto */}
      {openModal && (
      <div className="modal">
        <div className="modal-content">
          <h2>{isAddingProduct ? "Agregar Producto" : "Editar Producto"}</h2>
          <form>
            <label>
              Marca:
              <select
                name="marca"
                value={selectedProduct?.marca || ""}
                onChange={handleInputChange}
              >
                <option value="Gasco">Gasco</option>
                <option value="Abastible">Abastible</option>
                <option value="Lipigas">Lipigas</option>
              </select>
            </label>
            <label>
              Formato:
              <select
                name="formato"
                value={selectedProduct?.formato || ""}
                onChange={handleInputChange}
              >
                <option value="5kg">5kg</option>
                <option value="11kg">11kg</option>
                <option value="15kg">15kg</option>
                <option value="45kg">45kg</option>
              </select>
            </label>
            <label>
              Precio:
              <input
                type="number"
                name="precio"
                value={selectedProduct?.precio || ""}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Stock:
              <input
                type="number"
                name="stock"
                value={selectedProduct?.stock || ""}
                onChange={handleInputChange}
              />
            </label>
            <button
              type="button"
              onClick={isAddingProduct ? handleAddNewProduct : handleSave}
            >
              {isAddingProduct ? "Agregar Producto" : "Guardar Cambios"}
            </button>
            <button type="button" onClick={handleCloseModal}>
              Cancelar
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};

export default Single;
