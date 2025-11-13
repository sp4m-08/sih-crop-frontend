import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Edit2, Save, X, MapPin, Wheat, Maximize2, TrendingUp, IndianRupee, Calendar, RefreshCw, Map } from "lucide-react";

const Profile = () => {
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    preferredCrop: "",
    farmSizeAcres: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [originalData, setOriginalData] = useState({});
  const [priceData, setPriceData] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const API_URL = "https://sih-crop-backend-3sjd.onrender.com/api/profile";
  const PRICE_API_URL = "https://agmarket-api-main.onrender.com/request";

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (formData.city && formData.state && formData.preferredCrop && !isEditing) {
      fetchPriceData();
    }
  }, [formData.city, formData.state, formData.preferredCrop, isEditing]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setMessage({ text: "No token found. Please login again.", type: "error" });
        setLoading(false);
        return;
      }
      
      const response = await fetch(API_URL, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse location if it's in "City, State" format from old data
        let city = data.city || "";
        let state = data.state || "";
        
        if (!city && !state && data.location) {
          const locationParts = data.location.split(',').map(part => part.trim());
          city = locationParts[0] || "";
          state = locationParts[1] || "";
        }
        
        const profileData = {
          city,
          state,
          preferredCrop: data.preferredCrop || "",
          farmSizeAcres: data.farmSizeAcres?.toString() || "",
        };
        setFormData(profileData);
        setOriginalData(profileData);
      } else if (response.status === 404) {
        setIsEditing(true);
      } else if (response.status === 401) {
        setMessage({ text: "Authentication failed. Please login again.", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ text: "Error loading profile.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceData = async () => {
    setLoadingPrices(true);
    try {
      // Capitalize crop name for API
      const commodity = formData.preferredCrop.charAt(0).toUpperCase() + 
                       formData.preferredCrop.slice(1).toLowerCase();

      const url = `${PRICE_API_URL}?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(formData.state)}&market=${encodeURIComponent(formData.city)}`;
      
      console.log("Fetching prices from:", url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setPriceData(data.slice(0, 5)); // Get latest 5 entries
      } else {
        console.error("Failed to fetch price data");
        setPriceData([]);
      }
    } catch (error) {
      console.error("Error fetching price data:", error);
      setPriceData([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ text: "", type: "" });
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setMessage({ text: "No token found. Please login again.", type: "error" });
        setSaving(false);
        return;
      }
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          city: formData.city,
          state: formData.state,
          location: `${formData.city}, ${formData.state}`, // Send combined for backward compatibility
          preferredCrop: formData.preferredCrop,
          farmSizeAcres: Number(formData.farmSizeAcres),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: "success" });
        setOriginalData(formData);
        setIsEditing(false);
        
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else if (response.status === 401) {
        setMessage({ text: "Authentication failed. Please login again.", type: "error" });
      } else {
        setMessage({ text: data.message || "Failed to save profile", type: "error" });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ text: "Error saving profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            {!isEditing && formData.city && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Success/Error Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                {!isEditing ? (
                  // VIEW MODE
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <MapPin className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">City</h3>
                        <p className="text-lg font-semibold text-gray-800">
                          {formData.city || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Map className="text-purple-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">State</h3>
                        <p className="text-lg font-semibold text-gray-800">
                          {formData.state || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Wheat className="text-green-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Preferred Crop</h3>
                        <p className="text-lg font-semibold text-gray-800 capitalize">
                          {formData.preferredCrop || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Maximize2 className="text-amber-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Farm Size</h3>
                        <p className="text-lg font-semibold text-gray-800">
                          {formData.farmSizeAcres ? `${formData.farmSizeAcres} Acres` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // EDIT MODE
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                      <Edit2 size={20} />
                      <span className="font-medium">Edit Your Profile</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City/Market
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g., Vellore, Chennai"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="e.g., Tamil Nadu"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="preferredCrop" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Crop
                      </label>
                      <input
                        type="text"
                        id="preferredCrop"
                        name="preferredCrop"
                        value={formData.preferredCrop}
                        onChange={handleChange}
                        placeholder="e.g., potato, rice, wheat, onion"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="farmSizeAcres" className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size (Acres)
                      </label>
                      <input
                        type="number"
                        id="farmSizeAcres"
                        name="farmSizeAcres"
                        value={formData.farmSizeAcres}
                        onChange={handleChange}
                        placeholder="e.g., 5"
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium text-white transition-all ${
                          saving
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98]"
                        }`}
                      >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      
                      {formData.city && (
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note:</strong> Your profile information helps us provide
                  personalized crop recommendations, market prices, and farming advice tailored to
                  your location and preferences.
                </p>
              </div>
            </div>

            {/* Market Prices Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Market Prices</h2>
                  </div>
                  <button
                    onClick={fetchPriceData}
                    disabled={loadingPrices || !formData.city || !formData.state || !formData.preferredCrop}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={loadingPrices ? "animate-spin" : ""} />
                  </button>
                </div>

                {!formData.city || !formData.state || !formData.preferredCrop ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      Complete your profile to see market prices
                    </p>
                  </div>
                ) : loadingPrices ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading prices...</p>
                  </div>
                ) : priceData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No price data available for your crop and location
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priceData.map((price, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{price.Date}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-600 capitalize">{price.Variety}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Min Price:</span>
                            <span className="text-sm font-semibold text-red-600 flex items-center gap-1">
                              <IndianRupee size={12} />
                              {price["Min Price"]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Max Price:</span>
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                              <IndianRupee size={12} />
                              {price["Max Price"]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-700">Modal Price:</span>
                            <span className="text-base font-bold text-blue-600 flex items-center gap-1">
                              <IndianRupee size={14} />
                              {price["Modal Price"]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile