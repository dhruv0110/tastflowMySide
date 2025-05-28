
import Sidebar from './Sidebar'

const Admin = () => {
  return (
    <div style={{backgroundColor:"#1B1C1F",borderTop:"1.5px solid #a9a9a9",display:"flex"}}>
      <Sidebar />
      <div style={{color:"white",width:"100%"}}>
        <h1 style={{textAlign:"center",marginTop:"17rem"}}>Welcome to Admin Panel</h1>
      </div>
    </div>
  )
}

export default Admin
