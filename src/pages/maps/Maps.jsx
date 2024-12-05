import React, { useEffect, useState } from 'react';
import './maps.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Ruta de tu configuración de Firebase
import locationPin from '../../assets/location-pin.png';
import ProvPin from '../../assets/destination.png';

const containerStyle = {
  width: '100%',
  height: '160%',
  borderRadius: '15px',
};

const center = {
  lat: -33.4489, // Santiago, Chile
  lng: -70.6693,
};

const Maps = () => {
  const [locations, setLocations] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [filter, setFilter] = useState('todos'); // Estado para el filtro (todos, proveedores, usuarios)

  useEffect(() => {
    // Función para obtener las ubicaciones
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(db, "userLocations"));
      const userLocations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLocations(userLocations);
    };

    // Función para obtener los perfiles de usuario
    const fetchUserProfiles = async () => {
      const querySnapshot = await getDocs(collection(db, "userProfiles"));
      const profiles = {};
      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        profiles[docSnap.id] = userData.tipoUsuario; // Guarda el tipo de usuario con el ID
      }

      setUserProfiles(profiles);
    };

    fetchLocations();
    fetchUserProfiles();
  }, []);

  // Filtrar los marcadores según el tipo de usuario seleccionado
  const filteredLocations = locations.filter(location => {
    const userType = userProfiles[location.id];
    if (filter === 'todos') return true;
    if (filter === 'proveedores' && userType === 'proveedor') return true;
    if (filter === 'usuarios' && userType === 'usuario') return true;
    return false;
  });

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="listContainer">
          <div className="listTitle">Mapa</div>
          <div className="filterButtons">
            <button onClick={() => setFilter('todos')}>Mostrar Todos</button>
            <button onClick={() => setFilter('proveedores')}>Mostrar Proveedores</button>
            <button onClick={() => setFilter('usuarios')}>Mostrar Usuarios</button>
          </div>
          <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={11}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
              scaleControl: false,
              rotateControl: false,
              
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
              ],
            }}
          >
            {filteredLocations.map((location) => {
              const userType = userProfiles[location.id]; // Obtén el tipo de usuario usando el id
              const iconUrl = userType === "proveedor" 
              ? {
                  url: ProvPin,
                  scaledSize: new window.google.maps.Size(30, 30), // Reducir el tamaño del ícono a 40x40 píxeles
                }
              : userType === "usuario" // Si es usuario, usa la imagen proporcionada
              ? {
                  url: locationPin,
                  scaledSize: new window.google.maps.Size(30, 30), // Ajusta el tamaño si es necesario
                }
              : undefined; // Si no es ni proveedor ni usuario, usa el marcador predeterminado

              return (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={iconUrl} // Asigna el icono si es proveedor
                />
              );
            })}
          </GoogleMap>
        </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default Maps;


