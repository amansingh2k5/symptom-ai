const axios = require("axios");


const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
        node["amenity"="doctors"](around:${radius},${lat},${lng});
      );
      out body 25;
    `;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: { "Content-Type": "text/plain" },
        timeout: 10000,
      }
    );

    const doctors = response.data.elements.map((place) => {
      const tags = place.tags || {};

      
      const addressParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:suburb"],
        tags["addr:city"],
      ].filter(Boolean);

      const address =
        addressParts.length > 0
          ? addressParts.join(", ")
          : "Address not available";

      return {
        placeId: place.id,
        name: tags.name || "Local Clinic",
        specialty: "General Physician",
        address,
        rating: null,
        reviews: 0,
        photo: null,
        open: null,
        location: {
          lat: place.lat,
          lng: place.lon,
        },
      };
    });

    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Doctor API error:", error.message);

   
    res.json({
      success: true,
      doctors: [],
    });
  }
};


const getDoctorDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    res.json({
      success: true,
      doctor: {
        id: placeId,
        name: "Doctor details not available (OpenStreetMap)",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details",
    });
  }
};

module.exports = {
  getNearbyDoctors,
  getDoctorDetails,
};