import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const Widget = ({ type }) => {
  const [amount, setAmount] = useState(null);
  const [diff, setDiff] = useState(null);
  let data;

  switch (type) {
    case "user":
      data = {
        title: "USUARIOS",
        isMoney: false,
        link: "Ver Todos los Usuarios",
        query: "userProfiles", // Aquí especificamos la colección de usuarios
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "PEDIDOS",
        isMoney: false,
        link: "Ver todos los pedidos",
        query: "pedidos", // Aquí especificamos la colección de pedidos
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "TOTAL VENTAS",
        isMoney: true,
        link: "Ver ganancias netas",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "product":
      data = {
        title: "PROVEEDORES",
        query: "userProfiles", // Aquí especificamos la colección de productos
        link: "Ver detalles",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      try {
        if (data.query === "userProfiles") {
          const usersCollection = collection(db, data.query);
          const usersSnapshot = await getDocs(usersCollection);
  
          let totalUsers = 0;
          let totalProveedores = 0;
  
          usersSnapshot.docs.forEach((doc) => {
            const tipoUsuario = doc.data().tipoUsuario;
            if (tipoUsuario === "usuario") {
              totalUsers++;
            } else if (tipoUsuario === "proveedor") {
              totalProveedores++;
            }
          });
  
          if (isMounted) {
            if (type === "user") {
              setAmount(totalUsers);
              console.log("Total de usuarios:", totalUsers);
            } else if (type === "product") {
              setAmount(totalProveedores);
              console.log("Total de proveedores:", totalProveedores);
            }
            setDiff(0);
          }
        } else if (data.query === "pedidos") {
          const pedidosCollection = collection(db, data.query);
          const pedidosSnapshot = await getDocs(
            query(pedidosCollection, where("estado", "==", "Llegado"))
          );
          const totalPedidos = pedidosSnapshot.docs.length;
  
          if (isMounted) {
            setAmount(totalPedidos);
            setDiff(0);
            console.log("Total de pedidos finalizados:", totalPedidos);
          }

        } else if (data.query === "products") {
          const productsCollection = collection(db, data.query);
          const productsSnapshot = await getDocs(productsCollection);
          const totalProducts = productsSnapshot.docs.length;
  
          if (isMounted) {
            setAmount(totalProducts);
            setDiff(0);
            console.log("Total de productos:", totalProducts);
          }

        } else if (type === "earning") {
          const pedidosCollection = collection(db, "pedidos");
          const pedidosSnapshot = await getDocs(
            query(pedidosCollection, where("estado", "==", "Llegado"))
          );
  
          let totalGanancias = 0;
          pedidosSnapshot.docs.forEach((doc) => {
            const precio = parseFloat(doc.data().precio);
            if (!isNaN(precio)) {
              totalGanancias += precio;
            } else {
              console.log(`Precio no válido en el documento ${doc.id}:`, doc.data().precio);
            }
          });
          
          if (isMounted) {
            setAmount(totalGanancias);
            console.log("Total de ganancias:", totalGanancias);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
    };
  }, [data.query, type]); // Incluye 'type' como dependencia para evitar errores de actualización.
  
  
  
  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "$"} {amount} {/* Mostrar el total de ganancias, usuarios, pedidos o productos */}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className={`percentage ${diff < 0 ? "negative" : "positive"}`}>
          {diff < 0 ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          {diff} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
