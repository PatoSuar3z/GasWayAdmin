import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const getChileDate = () => {
  const chileOffset = -3; // Chile tiene UTC-3 (a menos que sea horario de verano)
  const localDate = new Date();
  localDate.setHours(localDate.getHours() + chileOffset - localDate.getTimezoneOffset() / 60);
  return localDate;
};

const Featured = () => {
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [pedidosSemanaPasada, setPedidosSemanaPasada] = useState(0);
  const [pedidosMesAnterior, setPedidosMesAnterior] = useState(0);

  useEffect(() => {
    // Fecha de hoy a las 00:00 en la hora de Chile
    const today = getChileDate();
    today.setHours(0, 0, 0, 0);
    console.log("Fecha de hoy (Chile): ", today);

    // Fecha de inicio de la semana pasada
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    // Fecha de inicio del mes pasado
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    // Query para pedidos de hoy con estado "finalizado"
    const qToday = query(
      collection(db, "pedidos"),
      where("estado", "==", "Llegado"), // Filtro para estado "finalizado"
      where("timestamp", ">=", today)
    );
    const unsubscribeToday = onSnapshot(qToday, (snapshot) => {
      setTotalPedidos(snapshot.size);
    });

    // Query para pedidos de la semana pasada con estado "finalizado"
    const qLastWeek = query(
      collection(db, "pedidos"),
      where("estado", "==", "Llegado"), // Filtro para estado "finalizado"
      where("timestamp", ">=", lastWeek),
      where("timestamp", "<", today)
    );
    const unsubscribeLastWeek = onSnapshot(qLastWeek, (snapshot) => {
      setPedidosSemanaPasada(snapshot.size);
    });

    // Query para pedidos del mes pasado con estado "finalizado"
    const qLastMonth = query(
      collection(db, "pedidos"),
      where("estado", "==", "Llegado"), // Filtro para estado "finalizado"
      where("timestamp", ">=", lastMonth),
      where("timestamp", "<", today)
    );
    const unsubscribeLastMonth = onSnapshot(qLastMonth, (snapshot) => {
      setPedidosMesAnterior(snapshot.size);
    });

    return () => {
      unsubscribeToday();
      unsubscribeLastWeek();
      unsubscribeLastMonth();
    };
  }, []);

  const target = 50; // Objetivo de pedidos diarios
  const progress = (totalPedidos / target) * 50;

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Pedidos</h1>
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar value={progress} text={`${Math.round(progress)}%`} strokeWidth={5} />
        </div>
        <p className="title">Total Pedidos Hoy</p>
        <p className="amount">{totalPedidos}</p>
        <p className="desc">
          Las transacciones previas están en proceso. Los últimos pagos pueden no estar incluidos.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Objetivo</div>
            <div className={`itemResult ${progress < 100 ? "negative" : "positive"}`}>
              {progress < 100 ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpOutlinedIcon fontSize="small" />}
              <div className="resultAmount">{target}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Semana Pasada</div>
            <div className={`itemResult ${pedidosSemanaPasada < totalPedidos ? "negative" : "positive"}`}>
              {pedidosSemanaPasada < totalPedidos ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpOutlinedIcon fontSize="small" />}
              <div className="resultAmount">{pedidosSemanaPasada}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Mes Anterior</div>
            <div className={`itemResult ${pedidosMesAnterior < totalPedidos ? "negative" : "positive"}`}>
              {pedidosMesAnterior < totalPedidos ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpOutlinedIcon fontSize="small" />}
              <div className="resultAmount">{pedidosMesAnterior}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;