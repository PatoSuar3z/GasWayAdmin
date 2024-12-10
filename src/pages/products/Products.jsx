import React, { useState, useEffect } from "react";
import "./products.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Bar } from "react-chartjs-2"; // Usamos el gráfico de barras
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";

// Registro de elementos para Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale);

const Products = () => {
  const [ventasPorMarca, setVentasPorMarca] = useState({
    Gasco: {},
    Lipigas: {},
    Abastible: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      const pedidosSnapshot = await getDocs(collection(db, "pedidos"));
      const pedidos = pedidosSnapshot.docs.map((doc) => doc.data());

      const conteoPorMarca = {
        Gasco: {},
        Lipigas: {},
        Abastible: {},
      };

      pedidos.forEach((pedido) => {
        if (pedido.producto && Array.isArray(pedido.producto)) {
          pedido.producto.forEach(({ product }) => {
            if (product && product.nombre && product.marca) {
              const { nombre, marca } = product;
              if (["Gasco", "Lipigas", "Abastible"].includes(marca)) {
                conteoPorMarca[marca][nombre] = (conteoPorMarca[marca][nombre] || 0) + 1;
              }
            }
          });
        }
      });

      setVentasPorMarca(conteoPorMarca);
      console.log("Conteo por marca:", conteoPorMarca);
    };

    fetchData();
  }, []);

  // Función para generar los datos para el gráfico con colores personalizados
  const generarDatosGrafico = (marca, datos) => {
    let backgroundColor = "";
    let borderColor = "";

    // Asignamos colores según la marca
    switch (marca) {
      case "Gasco":
        backgroundColor = "rgba(0, 255, 255, 0.4)"; // Celeste transparente
        borderColor = "rgba(0, 255, 255, 1)"; // Celeste sólido
        break;
      case "Lipigas":
        backgroundColor = "rgba(255, 255, 0, 0.4)"; // Amarillo transparente
        borderColor = "rgba(255, 255, 0, 1)"; // Amarillo sólido
        break;
      case "Abastible":
        backgroundColor = "rgba(255, 165, 0, 0.6)"; // Naranja transparente
        borderColor = "rgba(255, 165, 0, 1)"; // Naranja sólido
        break;
      default:
        break;
    }

    return {
      labels: Object.keys(datos), // Nombres de los productos
      datasets: [
        {
          label: `Ventas de ${marca}`,
          data: Object.values(datos), // Conteo de productos por nombre
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 1,
        },
      ],
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              stepSize: 1, // Esto asegura que los números en el eje Y sean enteros
              beginAtZero: true, // Comienza desde cero
              precision: 0, // Asegura que los valores sean números enteros
            },
          },
        },
      },
    };
  };

  // Generamos el gráfico general que combina todas las marcas
  const generarDatosGraficoGeneral = () => {
    const allData = [];
    const allLabels = [];

    ["Gasco", "Lipigas", "Abastible"].forEach((marca) => {
      Object.entries(ventasPorMarca[marca]).forEach(([producto, cantidad]) => {
        allLabels.push(producto);
        allData.push(cantidad);
      });
    });

    return {
      labels: allLabels,
      datasets: [
        {
          label: "Ventas Totales",
          data: allData,
          backgroundColor: "rgba(0, 123, 255, 0.6)", // Azul transparente
          borderColor: "rgba(0, 123, 255, 1)", // Azul sólido
          borderWidth: 1,
        },
      ],
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              stepSize: 1, // Esto asegura que los números en el eje Y sean enteros
              beginAtZero: true, // Comienza desde cero
              precision: 0, // Asegura que los valores sean números enteros
            },
          },
        },
      },
    };
  };

  return (
    <div className="products">
      <Sidebar />
      <div className="productsContainer">
        <Navbar />
        <div className="listContainer">
          <div className="listTitle">Ventas por Marca</div>
          <div className="chartsContainer">
            <div className="chartsRow">
              {/* Gráfico general y Gasco en la primera columna */}
              <div className="chart">
                <h2>Gráfico General</h2>
                <Bar data={generarDatosGraficoGeneral()} />
              </div>
              <div className="chart">
                <h2>Gasco</h2>
                <Bar data={generarDatosGrafico("Gasco", ventasPorMarca["Gasco"])} />
              </div>
            </div>

            <div className="chartsRow">
              {/* Abastible y Lipigas en la segunda columna */}
              <div className="chart">
                <h2>Abastible</h2>
                <Bar data={generarDatosGrafico("Abastible", ventasPorMarca["Abastible"])} />
              </div>
              <div className="chart">
                <h2>Lipigas</h2>
                <Bar data={generarDatosGrafico("Lipigas", ventasPorMarca["Lipigas"])} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
