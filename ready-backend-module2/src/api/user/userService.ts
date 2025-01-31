import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


const s3 = new S3Client({region: 'us-east-1'});


export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      const users = await this.userRepository.findAllAsync();
      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  // Creates a new user
  async create(userData: Partial<User>): Promise<ServiceResponse<User | null>> {
    try {
      const newUser = await this.userRepository.createAsync(userData);
      return ServiceResponse.success<User>("User created successfully", newUser, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadPhoto(photoId: string, file: any): Promise<ServiceResponse<{ url: string } | null>> {
    try {
      if (!file) {
          return ServiceResponse.failure("No file provided", null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // S3 object key
      const userName = photoId.split('@')[0];
      const objectKey = `${userName}.png`;

      // Check if the object already exists in S3
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: objectKey,
        });
        await s3.send(headCommand);

        // If the object exists, return its URL
        const existingUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
        return ServiceResponse.success("Photo already exists", { url: existingUrl });
      } catch (error: any) {
        if (error.name !== "NotFound") {
          console.error("Error checking if photo exists:", error);
          return ServiceResponse.failure("Error checking if photo exists", null, 500);
        }
      }

      // Read the uploaded file
      const fileContent = fs.readFileSync(file.path);

      // S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey, 
        Body: fileContent,
        ContentType: file.mimetype,
      };

      // Upload the file to S3
      const command = new PutObjectCommand(params);
      await s3.send(command);

      // Construct file URL
      const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;

      return ServiceResponse.success("Photo uploaded successfully", { url });

    } catch (error) {
      console.error("Error uploading photo:", error);
      return ServiceResponse.failure("Error uploading photo", null, 500);
    }
    finally {
      // Cleanup the temporary file
      if (file?.path) {
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error(`Error deleting temporary file at ${file.path}:`, err);
            } else {
                console.log(`Temporary file ${file.path} deleted.`);
            }
        });
      }
    }
  }
}

export const userService = new UserService();
