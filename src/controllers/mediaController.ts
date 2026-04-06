// import { Request, Response } from "express";
// import {
//   ListObjectsV2Command,
//   ListObjectsV2CommandOutput,
// } from "@aws-sdk/client-s3";
// import s3 from "../config/s3";
// import redisClient from "../config/redis";

// const BUCKET_NAME = "exceptionallearning";
// const REGION = "us-east-1";
// const CACHE_KEY = "s3:all-file-links";

// export const getAllS3FileLinks = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     // 1️⃣ Check Redis cache
//     const cachedData = await redisClient.get(CACHE_KEY);
//     if (cachedData) {
//       return res.status(200).json({
//         success: true,
//         cached: true,
//         count: JSON.parse(cachedData).length,
//         data: JSON.parse(cachedData),
//       });
//     }


//     // 2️⃣ Fetch from S3
//     let isTruncated = true;
//     let continuationToken: string | undefined;
//     const fileLinks: string[] = [];

//     while (isTruncated) {
//       const command = new ListObjectsV2Command({
//         Bucket: BUCKET_NAME,
//         ContinuationToken: continuationToken,
//       });

//       const response: ListObjectsV2CommandOutput = await s3.send(command);

//       response.Contents?.forEach((item) => {
//         if (item.Key && !item.Key.endsWith("/")) {
//           fileLinks.push(
//             `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${item.Key}`
//           );
//         }
//       });

//       isTruncated = Boolean(response.IsTruncated);
//       continuationToken = response.NextContinuationToken;
//     }

//     // 3️⃣ Save permanently in Redis (no TTL)
//     await redisClient.set(CACHE_KEY, JSON.stringify(fileLinks));

//     // 4️⃣ Return response
//     return res.status(200).json({
//       success: true,
//       cached: false,
//       count: fileLinks.length,
//       data: fileLinks,
//     });
//   } catch (error) {
//     console.error("S3 + Redis Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch media files links",
//     });
//   }
// };
