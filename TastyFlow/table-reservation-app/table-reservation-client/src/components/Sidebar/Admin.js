import React from 'react'
import Sidebar from './Sidebar'

const Admin = ({showAlert}) => {
  return (
    <div style={{backgroundColor:"#1B1C1F",borderTop:"1.5px solid #a9a9a9",display:"flex"}}>
      <Sidebar showAlert={showAlert}/>
    </div>
  )
}

export default Admin
