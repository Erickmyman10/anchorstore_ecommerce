import { Users, ShieldCheck } from "lucide-react";

const AdminCustomers = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center gap-2 mb-1">
      <ShieldCheck className="w-4 h-4 text-brand-500" />
      <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Admin Panel</span>
    </div>
    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Customer Management</h1>
    <p className="text-sm text-gray-400 mb-10">Browse and manage registered customers.</p>

    <div className="flex flex-col items-center justify-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
      <Users className="w-12 h-12 mb-4 opacity-30" />
      <p className="font-semibold text-gray-500">Customer management coming soon</p>
      <p className="text-sm mt-1">This section is under construction.</p>
    </div>
  </div>
);

export default AdminCustomers;
