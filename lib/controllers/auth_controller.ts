import axios from "axios";
import { UserModel } from "../db/user";

// Step 1 — Redirect user to OAuth provider
export async function authorize(req, res, next) {
  (req as any).storeID = req.params.storeID;
  console.log(req.params.storeID, "storeID in auth route");

  const authUrl = `${process.env.OAUTH_PROVIDER_URL}?client_id=${process.env.CLIENT_ID}&state=${req.params.storeID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(authUrl, next);
}

// Step 2 — Handle callback & exchange code for token
export async function authorizationCallback(req, res, next) {
  const code = req.query.code;
  const storeID = req.query.state;

  try {
    const response = await axios.post(process.env.TOKEN_URL, {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI,
    });

    const { access_token } = response.data;
    // Store tokens securely
    // Update your database with the tokens associated with the storeID
    const userModel = new UserModel();
    await userModel.storeToken(storeID, access_token);
    console.log("Access Token:", access_token);

    res.json({ message: "Authentication successful!", access_token });
  } catch (err) {
    console.error(err);
    next({ error: "OAuth token exchange failed" });
  }
}
