import React from 'react'
import "./users.scss"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import Datatable from '../../components/datatable/Datatable';


const Users = () => {
    return (
        <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="bottom">
            <Datatable/>
          </div>
        </div>
      </div>
    )
}

export default Users