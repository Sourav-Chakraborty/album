import { baseApi } from "./baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    chunkUpload: builder.mutation<any, FormData>({
      query: (file) => ({
        url: "/file/chunk",
        method: "POST",
        body: file,
      }),
    }),

    chunkMerge: builder.mutation<any, any>({
      query: (file) => ({
        url: "/file/upload",
        method: "POST",
        body: file,
      }),
    }),
  }),
});

export const { useChunkUploadMutation, useChunkMergeMutation } = uploadApi;
