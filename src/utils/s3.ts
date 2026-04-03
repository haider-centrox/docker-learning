import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.BUCKET_NAME as string;

/**
 * Upload an image to S3
 * @param file - File buffer to upload
 * @param fileName - Name for the file in S3
 * @param mimetype - MIME type of the file
 * @returns The URL of the uploaded file
 */
export const uploadImageToS3 = async (
  file: Buffer,
  fileName: string,
  mimetype: string
): Promise<string> => {
  try {
    const key = `profile-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: mimetype,
    });

    await s3Client.send(command);

    // Return the public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};

/**
 * Delete an image from S3
 * @param imageUrl - Full URL of the image to delete
 */
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the key from the URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete image from S3");
  }
};

/**
 * Update an image in S3 (delete old and upload new)
 * @param oldImageUrl - URL of the old image to delete
 * @param newFile - New file buffer to upload
 * @param fileName - Name for the new file
 * @param mimetype - MIME type of the new file
 * @returns The URL of the new uploaded file
 */
export const updateImageInS3 = async (
  oldImageUrl: string | null,
  newFile: Buffer,
  fileName: string,
  mimetype: string
): Promise<string> => {
  try {
    // Delete old image if exists
    if (oldImageUrl) {
      await deleteImageFromS3(oldImageUrl);
    }

    // Upload new image
    const newImageUrl = await uploadImageToS3(newFile, fileName, mimetype);

    return newImageUrl;
  } catch (error) {
    console.error("Error updating image in S3:", error);
    throw new Error("Failed to update image in S3");
  }
};

/**
 * Generate a signed URL for temporary access to a private S3 object
 * @param imageUrl - Full URL of the image
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns A signed URL for temporary access
 */
export const getSignedImageUrl = async (
  imageUrl: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};
