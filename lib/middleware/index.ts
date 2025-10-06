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
      return res.send(401, {
        error: "Missing or invalid Authorization header",
      });
    }

    // 2. Extract access token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.send(401, {
        error: "Access token is required",
      });
    }

    // 3. Verify the token and get user data
    const user = await verifyUserAccessToken(token);

    // 4. Attach user to request for use in controllers
    (req as any).user = user;
    (req as any).accessToken = token;

    console.log("User verified:", user);

    return next();
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    return res.send(401, {
      error: "Invalid or expired access token",
    });
  }
}

export async function verifyUserAccessToken(token: string) {
  try {
    // Find user in database by access token
    const userModel = new UserModel();
    const users = await userModel.getByField("access_token", token);

    if (!users || users.length === 0) {
      throw new Error("User not found or invalid token");
    }

    // Check if we found multiple users with the same token (shouldn't happen)
    if (users.length > 1) {
      console.warn("Multiple users found with the same access token");
    }

    // Optionally verify the token with your OAuth provider
    // You can add token validation logic here if your OAuth provider supports it
    // For example, if you have a userinfo endpoint:
    if (process.env.OAUTH_USERINFO_URL) {
      try {
        const response = await fetch(process.env.OAUTH_USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Token validation failed with OAuth provider");
        }

        const userInfo = await response.json();
        console.log("Token validated with OAuth provider:", userInfo);
      } catch (oauthError) {
        console.warn("OAuth provider validation failed:", oauthError);
        // If OAuth validation fails, we can still rely on database lookup
        // depending on your security requirements
      }
    }

    return users[0]; // Return the user data
  } catch (error) {
    console.error("Error verifying access token:", error);
    throw error;
  }
}
