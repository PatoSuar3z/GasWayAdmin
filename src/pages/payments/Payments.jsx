import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Ruta de tu configuración de Firebase
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./payments.scss";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transbank_payments"));
        const paymentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);

        // Calcular datos para el gráfico
        const statusCounts = paymentsData.reduce(
          (acc, payment) => {
            if (payment.status === "AUTHORIZED") acc.authorized++;
            if (payment.status === "DENIED") acc.denied++;
            return acc;
          },
          { authorized: 0, denied: 0 }
        );
        setChartData([
          { name: "Authorized", value: statusCounts.authorized },
          { name: "Denied", value: statusCounts.denied },
        ]);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 200 },
    {
      field: "amount",
      headerName: "Monto",
      width: 120,
      valueFormatter: (params) =>
        new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(params.value),
    },
    { field: "authorization_code", headerName: "Código de Autorización", width: 180 },
    { field: "buy_order", headerName: "Orden de Compra", width: 180 },
    { field: "pedidoId", headerName: "Pedido ID", width: 150 },
    { field: "session_id", headerName: "Session ID", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <div
          style={{
            color: params.value === "AUTHORIZED" ? "#4CAF50" : "#FF5252",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            border: `1px solid ${
              params.value === "AUTHORIZED" ? "#4CAF50" : "#FF5252"
            }`,
            borderRadius: "15px",
            padding: "5px 10px",
            textAlign: "center",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "timestamp",
      headerName: "Fecha",
      width: 200,
      valueFormatter: (params) => new Date(params.value.seconds * 1000).toLocaleString(),
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );

  const colors = ["#4CAF50", "#FF5252"];

  return (
    <div className="payments">
      <Sidebar />
      <div className="paymentsContainer">
        <Navbar />
        <Box padding={2}>
          <Typography variant="h5" gutterBottom>
            Registro de Pagos
          </Typography>

          {/* Gráfico de pastel */}
          <Box display="flex" justifyContent="center" marginBottom={4}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(2)}%)`
                  }
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <Typography variant="body2" color="textSecondary">
                      {value}
                    </Typography>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Tabla */}
          <Box height={500}>
            <DataGrid
              rows={filteredPayments}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              components={{
                Toolbar: CustomToolbar,
              }}
            />
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Payments;
