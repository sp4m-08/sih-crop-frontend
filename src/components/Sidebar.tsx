import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [farmName, setFarmName] = useState("My Farm");
  const [isEditingFarmName, setIsEditingFarmName] = useState(false);
  const [tempFarmName, setTempFarmName] = useState("My Farm");
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load farm name from localStorage on mount
  useEffect(() => {
    const savedFarmName = localStorage.getItem("farmName");
    if (savedFarmName) {
      setFarmName(savedFarmName);
      setTempFarmName(savedFarmName);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFarmNameEdit = () => {
    setTempFarmName(farmName);
    setIsEditingFarmName(true);
  };

  const handleFarmNameSave = () => {
    if (tempFarmName.trim()) {
      setFarmName(tempFarmName.trim());
      localStorage.setItem("farmName", tempFarmName.trim());
    }
    setIsEditingFarmName(false);
  };

  const handleFarmNameCancel = () => {
    setTempFarmName(farmName);
    setIsEditingFarmName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFarmNameSave();
    } else if (e.key === "Escape") {
      handleFarmNameCancel();
    }
  };

  const menuItems = [
    { name: "Chat", path: "/chat", icon: "💬" },
    { name: "Profile", path: "/profile", icon: "🧑‍🌾" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-white border-b shadow-sm z-40">
        <h1 className="text-xl font-bold text-blue-600">CropWise</h1>
        <button 
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-full md:w-64 bg-white md:border-r shadow-lg md:shadow-md transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Header with close button on mobile */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">CropWise</h1>
          <button 
            onClick={() => setOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-blue-100"
              }`}
              onClick={() => setOpen(false)}
            >
              <span className="text-xl">{item.icon}</span> 
              <span className="text-base">{item.name}</span>
            </Link>
          ))}

          {/* My Farm Section with Editable Name */}
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">My Farm</span>
              {!isEditingFarmName && (
                <button
                  onClick={handleFarmNameEdit}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            
            {isEditingFarmName ? (
              <div className="px-2 py-2 space-y-2">
                <input
                  type="text"
                  value={tempFarmName}
                  onChange={(e) => setTempFarmName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter farm name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleFarmNameSave}
                    className="flex-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleFarmNameCancel}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/sensors"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === "/sensors"
                    ? "bg-green-500 text-white"
                    : "text-gray-700 hover:bg-green-100"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">🌱</span>
                <span className="text-base">{farmName}</span>
              </Link>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 mt-4 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
          >
            <span className="text-xl">🚪</span> 
            <span className="text-base">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;