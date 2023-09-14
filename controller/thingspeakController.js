const axios = require("axios");

exports.getData = async (req, res, next) => {
  try {
    const channelId = 2234624; // Re"place with your ThingSpeak channel ID
    const apiKey = "6BTZSAXT7UDO1CR5"; // Replace with your ThingSpeak API key

    // Make a GET request to fetch ThingSpeak data
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=10`
    );

    const data = response.data;
    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Unable to fetch ThingSpeak data",
    });
  }
};
