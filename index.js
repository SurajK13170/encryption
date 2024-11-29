const express = require("express");
const forge = require("node-forge");
const cors = require("cors")
const app = express();

const port = 3000;
app.use(express.json());
app.use(cors())

// Example public key (Replace this with your actual RSA public key)
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
