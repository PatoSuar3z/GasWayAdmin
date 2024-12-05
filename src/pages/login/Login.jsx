import { useContext, useState } from "react";
import "./login.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import destinationIcon from "../../assets/destination.png"; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // Corregido el typo

  const { dispatch } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();

    // Verificar si el correo ingresado es el permitido
    if (email !== "soporte.gasway@outlook.com") {
      setError(true);
      return; // Evitar continuar si el correo no es el correcto
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        dispatch({ type: "LOGIN", payload: user });
        navigate("/"); // Redirige a la página principal
      })
      .catch(() => {
        setError(true); // Mostrar error si las credenciales no son correctas
      });
  };

  return (
    <div className="login">
      <div className="login-container">
        <img src={destinationIcon} alt="Destino" className="login-icon" />
        <h1 className="login-title">GasWay</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Iniciar Sesión</button>
          {error && <span>Correo o contraseña incorrecta</span>}
        </form>
      </div>
    </div>
  );
};

export default Login;
