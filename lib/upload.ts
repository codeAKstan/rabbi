import "server-only";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Uploads a file to UploadThing server side, generating a unique filename
 * using random UUID.
 * 
 * @param file The file object received from the frontend FormData
 * @param type The type of file (e.g., 'ebook', 'image')
 * @returns The secure UploadThing URL (ufsUrl)
 */
export const uploadFile = async (file: File, type: string): Promise<string> => {
    try {
        const uuid = crypto.randomUUID();
        const fileName = `${type}-${uuid}-${file.name}`;

        const newFile = new File([file], fileName, {
            type: file.type,
            lastModified: file.lastModified,
        });

        const uploadResponse = await utapi.uploadFiles(newFile);

        if (!uploadResponse.data) {
            throw new Error("No data returned from upload");
        }

        // The property ufsUrl contains the uploaded file's final secure URL link
        const docLink = uploadResponse.data.ufsUrl;
        return docLink;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("File upload failed");
    }
};
