import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

type cloudinaryResponse = UploadApiResponse | UploadApiErrorResponse | undefined;

interface cloudinaryParams {
  file: string;
  publid_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
}

export function upload(params: cloudinaryParams): Promise<cloudinaryResponse> {
  const { file, publid_id, overwrite, invalidate } = params;
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(file, { publid_id, overwrite, invalidate }, (error, result) => {
      if (error) resolve(error);
      resolve(result);
    });
  });
}
