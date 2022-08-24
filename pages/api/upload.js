const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  try {
    await cloudinary.uploader.upload(
      req.body.image,
      {
        detection: "cld-fashion",
      },
      (error, result) => {
        const tags =
          result.info.detection["object_detection"].data["cld-fashion"].tags;

        let values = [];
        for (const key of Object.keys(tags)) {
          for (const keyValue of tags[key]) {
            values.push({
              name: key,
              value: keyValue["bounding-box"].map((val) => Math.round(val)),
              confidence: keyValue.confidence.toFixed(2),
            });
          }
        }

        let transformArray = [];
        for (const val of values) {
          transformArray.push({ overlay: "filled-square" });

          transformArray.push({
            height: val.value[3],
            width: val.value[2],
            crop: "scale",
          });
          transformArray.push({ effect: "bgremoval:red" });
          transformArray.push({ border: "3px_solid_green" });
          transformArray.push({
            flags: "layer_apply",
            gravity: "north_west",
            x: val.value[0],
            y: val.value[1],
          });

          transformArray.push({
            background: "green",
            color: "white",
            overlay: {
              font_family: "Arial",
              font_size: 17,
              text: `${val.name} ${val.confidence}`,
            },
          });

          transformArray.push({
            flags: "layer_apply",
            gravity: "north_west",
            x: val.value[0],
            y: `${val.value[1] - 20}`,
          });
        }

        const transformedImg = cloudinary.image(`${result.public_id}.jpg`, {
          transformation: transformArray,
        });

        res.status(200).json(transformedImg);
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
