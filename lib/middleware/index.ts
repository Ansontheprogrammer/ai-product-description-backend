import fetch from "node-fetch";
import { UserModel } from "../db/user";

/* Middleware to verify user authentication and authorization
  1. Extracts the access token from the Bearer token in the Authorization header.
  2. Sends a request to Google’s tokeninfo endpoint to verify the token.
  3. If valid, attaches user info to req.user and calls next().
  4. If invalid or missing, returns 401 Unauthorized.
*/
export async function verifyUser(req, res, next) {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    // 2. Extract access token
    const token = authHeader.split(" ")[1];

    // 3. Verify the token
    await verifyUserAccessToken(token);
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifyUserAccessToken(token: string) {
  try {
    // 3. Verify the token with Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
    );
    const data = await response.json();

    // 4. Check if token is invalid
    if (!response.ok || data.error) {
      throw "Invalid or expired token";
    }

    // 5. Attach verified user info to request (optional fields depend on scopes)
    /// Find user in database by access token
    const userModel = new UserModel();
    const user = (await userModel.getByField("access_token", token)).length;

    if (!user) {
      throw "User not found";
    }

    return;
  } catch (error) {
    console.error("Error verifying access token:", error);
    throw error;
  }
}
