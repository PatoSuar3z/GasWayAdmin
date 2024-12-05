import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import TablePagination from "@mui/material/TablePagination";

const OrderList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Limitar a 10 filas por página

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            producto: Array.isArray(data.producto)
              ? data.producto.map((item) => ({
                  ...item,
                  product: item.product || "Producto no especificado",
                }))
              : [],
            ubicacionProveedor: Array.isArray(data.ubicacionProveedor) ? data.ubicacionProveedor : [],
            ubicacionCliente: Array.isArray(data.ubicacionCliente) ? data.ubicacionCliente : [],
          };
        });
        setRows(list);
        console.log(list);
      },
      (error) => {
        console.error("Error al obtener los datos:", error);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  // Manejo del cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejo del cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reiniciar la página a la primera al cambiar el número de filas
  };

  return (
    <>
      <TableContainer component={Paper} className="table">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="tableCell">Pedido ID</TableCell>
              <TableCell className="tableCell">Conductor</TableCell>
              <TableCell className="tableCell">Fecha</TableCell>
              <TableCell className="tableCell">Precio</TableCell>
              <TableCell className="tableCell">Productos</TableCell>
              <TableCell className="tableCell">Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Limitar los elementos por página
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="tableCell">{row.id}</TableCell>
                  <TableCell className="tableCell">{row.conductorId}</TableCell>
                  <TableCell className="tableCell">
                    {new Date(row.timestamp?.seconds * 1000).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="tableCell">{row.precio}</TableCell>
                    <TableCell className="tableCell">
                    {Array.isArray(row.producto) ? (
                      <ul>
                        {row.producto.map((prod, index) => (
                          <li key={index}>
                          <strong>{prod.product?.nombre || "Nombre no disponible"}</strong> - Cantidad: {prod.quantity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Sin productos"
                    )}
                  </TableCell>
                  <TableCell className="tableCell">{row.estado}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default OrderList;
