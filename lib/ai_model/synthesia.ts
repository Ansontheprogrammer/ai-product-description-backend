/**
 * SynthesiaInterface
 *
 * A class that provides methods to interact with the Synthesia API for creating and downloading videos generated with synthetic AI avatars.
 *
 * Dependencies:
 * - axios: A library for making HTTP requests
 * - fs: The Node.js filesystem module
 *
 * Example usage:
 * import synthesia from './synthesiaInterface';
 *
 * async function main() {
 *   try {
 *     const scriptText = "Hello, world!";
 *     const avatar = "anna_costume1_cameraA";
 *     const background = "green_screen";
 *     const outputFilename = "output.mp4";
 *
 *     const videoId = await synthesia.createVideo(scriptText, avatar, background);
 *     console.log("Created video with ID:", videoId);
 *
 *     const videoData = await synthesia.getVideoStatus(videoId);
 *     console.log("Video status:", videoData.status);
 *
 *     if (videoData.status === "COMPLETE") {
 *       await synthesia.downloadVideo(videoData.downloadUrl, outputFilename);
 *       console.log("Video downloaded successfully!");
 *     }
 *   } catch (error) {
 *     console.error("An error occurred:", error);
 *   }
 * }
 *
 * main();
 */

import axios from "axios";
import fs from "fs";

class SynthesiaInterface {
  apiKey: string;
  baseUrl: string;
  /**
   * Constructor
   *
   * Initializes a new instance of the SynthesiaInterface class.
   * Reads the SYNTHESIA_API_KEY environment variable and sets it as the apiKey property.
   * Sets the baseUrl property to the base URL of the Synthesia API.
   */
  constructor() {
    this.apiKey = process.env.SYNTHESIA_API_KEY;
    this.baseUrl = "https://api.synthesia.io/v2";
  }

  /**
   * createVideo
   *
   * Creates a new video using the Synthesia API.
   *
   * @param {string} scriptText - The text of the script for the video.
   * @param {string} [avatar="anna_costume1_cameraA"] - The avatar to be used for the video. Defaults to "anna_costume1_cameraA".
   * @param {string} [background="green_screen"] - The background to be used for the video. Defaults to "green_screen".
   * @returns {Promise<string>} A Promise that resolves to the ID of the newly created video.
   * @throws {Error} If an error occurs during the API request.
   */
  async createVideo(
    scriptText,
    avatar = "anna_costume1_cameraA",
    background = "green_screen"
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/videos`,
        {
          test: true,
          input: [
            {
              scriptText,
              avatar,
              background,
            },
          ],
        },
        {
          headers: {
            Authorization: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      // The API returns an ID of the newly created video
      return response.data.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * getVideoStatus
   *
   * Retrieves the status of a video from the Synthesia API.
   *
   * @param {string} videoId - The ID of the video.
   * @returns {Promise<object>} A Promise that resolves to the video status and download link once the video is ready.
   * @throws {Error} If an error occurs during the API request.
   */
  async getVideoStatus(videoId) {
    try {
      const response = await axios.get(`${this.baseUrl}/videos/${videoId}`, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      // The API returns the status of the video and a download link once it's ready
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * downloadVideo
   *
   * Downloads a video file from the specified URL and saves it to the local filesystem.
   *
   * @param {string} downloadUrl - The URL of the video file to download.
   * @param {string} outputFilename - The name of the file to save the downloaded video.
   * @returns {Promise<void>} A Promise that resolves when the download is complete.
   * @throws {Error} If an error occurs during the download.
   */
  async downloadVideo(downloadUrl, outputFilename) {
    try {
      const response = await axios.get(downloadUrl, { responseType: "stream" });
      response.data.pipe(fs.createWriteStream(outputFilename));
      return outputFilename;
    } catch (error) {
      throw error;
    }
  }

  /**
   * createAndDownloadVideo
   *
   * Combines the video creation, status polling, and download into a single method.
   *
   * @param {string} scriptText - The text of the script for the video.
   * @param {string} avatar - The avatar to be used for the video.
   * @param {string} background - The background to be used for the video.
   * @param {string} outputFilename - The name of the file to save the downloaded video.
   * @returns {Promise<string>} A Promise that resolves to the path of the downloaded video file.
   * @throws {Error} If an error occurs during the process.
   */
  async createAndDownloadVideo(
    scriptText,
    avatar = "anna_costume1_cameraA",
    background = "green_screen"
  ) {
    // Create the video
    const videoId = await this.createVideo(scriptText, avatar, background);

    // Poll the API until the video is ready
    let videoData = await this.getVideoStatus(videoId);
    while (videoData.status !== "COMPLETE") {
      // Wait for a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      videoData = await this.getVideoStatus(videoId);
    }

    // Download the video
    const outputFilename = await this.downloadVideo(
      videoData.downloadUrl,
      this.generateVideoRandomId()
    );

    // Return the path to the downloaded video
    return outputFilename;
  }

  /**
   * generateVideoRandomId
   *
   * Generates a random ID with the specified length and appends the ".mp4" extension.
   *
   * @param {number} [length=10] - The length of the random ID. Defaults to 10.
   * @returns {string} The generated random ID as a string with the ".mp4" extension.
   */
  generateVideoRandomId(length = 10) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let randomId = "";

    for (let i = 0; i < length; i++) {
      randomId += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }

    return randomId + ".mp4";
  }
}

// Create a new instance of SynthesiaInterface
const synthesia = new SynthesiaInterface();

// Export the instance as the default export
export default synthesia;
