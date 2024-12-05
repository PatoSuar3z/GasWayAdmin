import React from 'react';
import './products.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';



const Products = () => {
    return (
        <div className="products">
        <Sidebar />
        <div className="productsContainer">
          <Navbar />
          <div className="listContainer">
            <div className="listTitle">Stock de Productos</div>
            
          </div>
        </div>
      </div>
    );
};

export default Products;