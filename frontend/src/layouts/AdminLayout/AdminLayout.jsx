import HeaderAdmin from '@/layouts/components/HeaderAdmin';
import SidebarAdmin from '@/layouts/components/SidebarAdmin';


const AdminLayout = ({ children }) => {
    return (
        <div className="h-screen bg-gray-800">
            <HeaderAdmin />
            <div className="flex h-[82%]">
                <SidebarAdmin />
                {children}
            </div>
        </div>
    )
}

export default AdminLayout;