import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./order.scss";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ruta de tu configuración de Firebase

const Home = () => {
  const [pedidos, setPedidos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pedidosPerPage = 3;

  useEffect(() => {
    // Función para obtener los pedidos desde Firebase
    const fetchPedidos = async () => {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const pedidosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() // Asegúrate de convertir el timestamp si es necesario
      }));
      setPedidos(pedidosData);
    };
    fetchPedidos();
  }, []);

  // Filtrar los pedidos por estado
  const pedidosPendientes = pedidos.filter(pedido => pedido.estado === "pendiente");
  const pedidosEnCamino = pedidos.filter(pedido => pedido.estado === "en camino");
  const pedidosFinalizados = pedidos.filter(pedido => pedido.estado === "finalizado");
  const pedidosCancelados = pedidos.filter(pedido => pedido.estado === "cancelado");

  // Función para actualizar el estado del pedido a "cancelado"
  const handleCancelOrder = async (pedidoId) => {
    const pedidoRef = doc(db, "pedidos", pedidoId);
    try {
      // Actualiza el estado del pedido a "cancelado"
      await updateDoc(pedidoRef, {
        estado: "cancelado"
      });
      // Actualizar el estado localmente para que la UI se actualice
      setPedidos(prevPedidos =>
        prevPedidos.map(pedido =>
          pedido.id === pedidoId ? { ...pedido, estado: "cancelado" } : pedido
        )
      );
      alert("Pedido cancelado con éxito.");
    } catch (error) {
      console.error("Error al cancelar el pedido: ", error);
    }
  };

  // Paginación: seleccionar los pedidos a mostrar según la página actual
  const indexOfLastPedido = currentPage * pedidosPerPage;
  const indexOfFirstPedido = indexOfLastPedido - pedidosPerPage;
  const currentPedidos = pedidos.slice(indexOfFirstPedido, indexOfLastPedido);

  // Cambiar de página
  const nextPage = () => {
    if (currentPage < Math.ceil(pedidos.length / pedidosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="order">
      <Sidebar />
      <div className="orderContainer">
        <Navbar />
        <div className="listContainer">
          <div className="listTitle">Registro de Pedidos</div>

          {/* Cards con el total de pedidos por estado */}
          <div className="statusCards">
            <div className="statusCard">
              <h4>Pedidos Pendientes</h4>
              <p>{pedidosPendientes.length}</p>
            </div>
            <div className="statusCard">
              <h4>Pedidos En Camino</h4>
              <p>{pedidosEnCamino.length}</p>
            </div>
            <div className="statusCard">
              <h4>Pedidos Finalizados</h4>
              <p>{pedidosFinalizados.length}</p>
            </div>
            <div className="statusCard">
              <h4>Pedidos Cancelados</h4>
              <p>{pedidosCancelados.length}</p>
            </div>
          </div>

          <div className="orderColumns">
            {/* Columna para pedidos pendientes */}
            <div className="orderColumn">
              <h3>Pedidos Pendientes</h3>
              <div className="orderGrid">
                {pedidosPendientes.slice(indexOfFirstPedido, indexOfLastPedido).map(pedido => (
                  <div className="pedidoCard" key={pedido.id}>
                    <div className="pedidoId">ID: {pedido.id}</div>
                    <div className="pedidoEstado">Estado: {pedido.estado}</div>
                    {/* Mostrar el timestamp */}
                    {pedido.timestamp && (
                      <div className="pedidoTimestamp">Timestamp: {pedido.timestamp.toLocaleString()}</div>
                    )}
                    {/* Botón para cancelar el pedido */}
                    {pedido.estado !== "cancelado" && (
                      <button
                        className="cancelButton"
                        onClick={() => handleCancelOrder(pedido.id)}
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Columna para pedidos en camino */}
            <div className="orderColumn">
              <h3>Pedidos En Camino</h3>
              <div className="orderGrid">
                {pedidosEnCamino.slice(indexOfFirstPedido, indexOfLastPedido).map(pedido => (
                  <div className="pedidoCard" key={pedido.id}>
                    <div className="pedidoId">ID: {pedido.id}</div>
                    <div className="pedidoEstado">Estado: {pedido.estado}</div>
                    {/* Mostrar el timestamp */}
                    {pedido.timestamp && (
                      <div className="pedidoTimestamp">Timestamp: {pedido.timestamp.toLocaleString()}</div>
                    )}
                    {/* Botón para cancelar el pedido */}
                    {pedido.estado !== "cancelado" && (
                      <button
                        className="cancelButton"
                        onClick={() => handleCancelOrder(pedido.id)}
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Columna para pedidos finalizados */}
            <div className="orderColumn">
              <h3>Pedidos Finalizados</h3>
              <div className="orderGrid">
                {pedidosFinalizados.slice(indexOfFirstPedido, indexOfLastPedido).map(pedido => (
                  <div className="pedidoCard" key={pedido.id}>
                    <div className="pedidoId">ID: {pedido.id}</div>
                    <div className="pedidoEstado">Estado: {pedido.estado}</div>
                    {/* Mostrar el timestamp */}
                    {pedido.timestamp && (
                      <div className="pedidoTimestamp">Timestamp: {pedido.timestamp.toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Paginación */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage}</span>
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(pedidos.length / pedidosPerPage)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
