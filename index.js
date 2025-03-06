const express = require("express");
const forge = require("node-forge");
const cors = require("cors")
const app = express();

const port = 3000;
app.use(express.json());
app.use(cors())

// Example public key (Replace this with your actual RSA public key)
const publicKeyPem = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Zq7YKcjmccSBnR9CDHd6IX96V7D/a2XSMs+yCgejSe956mqjA/0Q9h+Xnx7ZZdwe2Tf2Jq/mWXa+gYdnta58otreXg/5oGnNV3Edlixz1Oc8tJg5bG4sIUCGZcbEQGSbm1iC+Fp1kS+YLVG4Su8KoRxcCvRJI2QkfqAruX3JoFjggOkv0TgWCo9z6NV6PPmPN3UsXyH3OPDi3Ewnvd64ngCUKPSBiIDwhLj2yYSShcxH8aWbrz00SJodBJzqgjvCfZuljBXXIN4Ngi/nzqEJ7woKQ1kNgWoHFZy7YL74PihW//4OlniSRoITX+7ChILIv2ezSmAdIjpNJ9Dg9XKcQIDAQAB";

// Function to encrypt text
function encryptText(plainText, publicKeyPem) {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    const encryptedBytes = publicKey.encrypt(plainText, "RSA-OAEP", {
      md: forge.md.sha1.create(), // Hash function for OAEP
      mgf1: {
        md: forge.md.sha1.create(), // Mask generation function (MGF1) with SHA-1
      },
    });

    const encryptedBase64 = forge.util.encode64(encryptedBytes);
    return encryptedBase64;
  } catch (error) {
    throw new Error("Encryption failed: " + error.message);
  }
}

// POST route to encrypt text
app.post("/encrypt", (req, res) => {
  const { plainText } = req.body;

  if (!plainText) {
    return res.status(400).json({ error: "plainText is required" });
  }

  try {
    const encryptedText = encryptText(plainText, publicKeyPem);
    res.json({ encryptedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
