const express = require("express");
const getAxiosInstance = require("./axiosInstance");
const axios = require("axios");
const cors = require("cors");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 3000;
const https = require("https");
const forge = require("node-forge");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const publicKeyPem = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO
4Xb+59KYVm9Hywbo77qETZVAyc6VIsxU+UWhd/k/YtjZibCznB+HaXWX9TVTFs9N
wgv7LRGq5uLczpZQDrU7dnGkl/urRA8p0Jv/f8T0MZdFWQgks91uFffeBmJOb58u
68ZRxSYGMPe4hb9XXKDVsgoSJaRNYviH7RgAI2QhTCwLEiMqIaUX3p1SAc178ZlN
8qHXSSGXvhDR1GKM+y2DIyJqlzfik7lD14mDY/I4lcbftib8cv7llkybtjX1Aayf
Zp4XpmIXKWv8nRM488/jOAF81Bi13paKgpjQUUuwq9tb5Qd/DChytYgBTBTJFe7i
rDFCmTIcqPr8+IMB7tXA3YXPp3z605Z6cGoYxezUm2Nz2o6oUmarDUntDhq/PnkN
ergmSeSvS8gD9DHBuJkJWZweG3xOPXiKQAUBr92mdFhJGm6fitO5jsBxgpmulxpG
0oKDy9lAOLWSqK92JMcbMNHn4wRikdI9HSiXrrI7fLhJYTbyU3I4v5ESdEsayHXu
iwO/1C8y56egzKSw44GAtEpbAkTNEEfK5H5R0QnVBIXOvfeF4tzGvmkfOO6nNXU3
o/WAdOyV3xSQ9dqLY5MEL4sJCGY1iJBIAQ452s8v0ynJG5Yq+8hNhsCVnklCzAls
IzQpnSVDUVEzv17grVAw078CAwEAAQ==
-----END PUBLIC KEY-----
`;

const publicKeyPem2 = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Zq7YKcjmccSBnR9CDHd6IX96V7D/a2XSMs+yCgejSe956mqjA/0Q9h+Xnx7ZZdwe2Tf2Jq/mWXa+gYdnta58otreXg/5oGnNV3Edlixz1Oc8tJg5bG4sIUCGZcbEQGSbm1iC+Fp1kS+YLVG4Su8KoRxcCvRJI2QkfqAruX3JoFjggOkv0TgWCo9z6NV6PPmPN3UsXyH3OPDi3Ewnvd64ngCUKPSBiIDwhLj2yYSShcxH8aWbrz00SJodBJzqgjvCfZuljBXXIN4Ngi/nzqEJ7woKQ1kNgWoHFZy7YL74PihW//4OlniSRoITX+7ChILIv2ezSmAdIjpNJ9Dg9XKcQIDAQAB
-----END PUBLIC KEY-----
`;

// Create an HTTPS agent that bypasses the proxy
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Only for self-signed certificates (optional)
});

// Handle data push requests
app.get("/", (req, res) => {
  res.send("Updated  Welcome!");
});

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

app.post("/encrypt/abhanumber", (req, res) => {
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

// POST route to encrypt text using publicKeyPem2
app.post("/encrypt", (req, res) => {
  const { plainText } = req.body;

  if (!plainText) {
    return res.status(400).json({ error: "plainText is required" });
  }

  try {
    const encryptedText = encryptText(plainText, publicKeyPem2);
    res.json({ encryptedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/proxy", (req, res) => {
  res.status(200).json({
    message: "HospiDash Proxy API",
  });
});

app.post("/HospiDashProxy", async (req, res) => {
  const { apiUrl, body, headers, method } = req.body;

  if (!apiUrl || !method) {
    return res
      .status(400)
      .json({ message: "Missing apiUrl or method in request" });
  }

  const timestamp = moment.utc().toISOString();
  const requestId = uuidv4();

  const finalHeaders = {
    ...headers,
    TIMESTAMP: timestamp,
    "REQUEST-ID": requestId,
  };

  try {
    const axiosInstance = getAxiosInstance();

    const response = await axiosInstance({
      method: method.toLowerCase(),
      url: apiUrl,
      data: method.toLowerCase() === "get" ? undefined : body,
      headers: finalHeaders,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error forwarding request:", error.message);

    res.status(error.response ? error.response.status : 500).json({
      message: error.message,
    });
  }
});
// Start server
app.listen(port, () => {
  console.log(`server is running on port 3000`);
});
