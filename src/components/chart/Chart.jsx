import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"; // Tu configuración de Firebase

const Chart = ({ aspect, title }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "pedidos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const monthlyData = {};

      // Lista de los meses en orden cronológico
      const allMonths = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate(); // Asegurémonos de que el timestamp se convierte a una fecha de JavaScript
        const monthIndex = timestamp.getMonth(); // Obtén el índice del mes (0-11)
        const month = allMonths[monthIndex]; // Usamos el índice para obtener el nombre del mes
        const precio = parseFloat(data.precio);
        const estado = data.estado;  // Asegúrate de que el campo "estado" existe en los datos

        // Solo sumar los precios de los productos cuyo estado es "finalizado"
        if (estado === "Llegado") {
          if (isNaN(precio)) {
            console.log("Invalid precio:", data.precio);  // Esto te ayudará a detectar valores incorrectos
            return;  // Si el precio no es válido, omite este documento
          }

          console.log(`Mes: ${month}, Precio: ${precio}`);

          // Acumula el precio por mes
          if (monthlyData[month]) {
            monthlyData[month] += precio;
          } else {
            monthlyData[month] = precio;
          }
        }
      });

      // Formatear los datos y ordenar por mes usando el índice numérico
      const formattedData = allMonths.map((month) => {
        return {
          name: month,
          Total: monthlyData[month] || 0, // Si no hay datos para el mes, poner 0
        };
      });

      // Ordenar los datos por el orden de los meses (de Enero a Diciembre)
      const sortedData = formattedData.sort((a, b) => {
        return allMonths.indexOf(a.name) - allMonths.indexOf(b.name);
      });

      setChartData(sortedData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="chart">
      <div className="title">{title}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          width={730}
          height={250}
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39c7ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#39c7ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#39c7ff"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
