"use client";

import * as Yup from "yup";

import { Button, FileInput, Label, Spinner, TextInput } from "flowbite-react";
import { Field, Form, Formik } from "formik";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@iconify/react";
import TitleCard from "@/app/components/shared/TitleBorderCard";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";

type FileWithPreview = File & { preview?: string };

const DocumentForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsData = searchParams?.get("data");
  const { handleApiResponse } = useHandleApiResponse();
  const [loading, setLoading] = useState(false);
  const [uploadedPaths, setUploadedPaths] = useState<any[]>([]);
  const [documents, setDocuments] = useState<
    {
      file: File;
      uploaded: boolean;
      filePath?: string;
     // description: string;
    }[]
  >([]);
  const [fileError, setFileError] = useState<string>("");

  const decodedData = useMemo(() => {
    if (searchParamsData) {
      try {
        const jsonStr = Buffer.from(searchParamsData, "base64").toString();
        return JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to decode", err);
      }
    }
    return null;
  }, [searchParamsData]);

  const validationSchema = Yup.object().shape({
    files: Yup.array()
      .of(
        Yup.mixed()
          .test(
            "fileType",
            "Only PDF files are allowed",
            (file: File) => file?.type === "application/pdf"
          )
          .test(
            "fileSize",
            "File size must be less than 10MB",
            (file: File) => file?.size <= 10  * 1024 * 1024
          )
      )
      .max(10, "You can only upload up to 10 files")
      .required("Please select at least one PDF file"),
  });

  const handleSubmit = async (
    values: { files: File[] },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setLoading(true);
    // Simulate API
    try {
      const formatted = documents?.map((file: any) => ({
        clientCollectionId: parseInt(decodedData?.collectionId),
        name: file?.file.name,
        extension: "pdf",
        // description: file.description || "", // fallback
        filePath: file?.filePath?.filePath, // already includes full path
      }));

      const payload = {
        body: formatted,
      };

      const response = await api.post("/document/addDocuments", payload);
      handleApiResponse(response);
      if (
        response?.data?.statusCode === 200 ||
        response?.data?.statusCode === 201
      ) {
        setDocuments([]);

        router.back();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch edit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

 const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: (field: string, value: any) => void,
  setFieldError: (field: string, message: string) => void
) => {
  const files = Array.from(e.target.files || []);
  const maxSize = 10 * 1024 * 1024; // 10MB

  const oversizedFiles = files.filter((file) => file.size > maxSize);
  const invalidTypeFiles = files.filter((file) => file.type !== "application/pdf");

  if (oversizedFiles.length > 0) {
    setFileError("One or more files exceed the 10MB size limit.");
    setFieldError("files", "One or more files exceed the 10MB size limit.");
    return;
  }

  if (invalidTypeFiles.length > 0) {
    setFileError("Only PDF files are allowed.");
    setFieldError("files", "Only PDF files are allowed.");
    return;
  }

  setFileError(""); // Clear previous errors

  const filteredFiles = files.filter(
    (file) => file.type === "application/pdf" && file.size <= maxSize
  );

  const limitedFiles = [
    ...documents,
    ...filteredFiles.map((f) => ({
      file: f,
      uploaded: false,
      filePath: "",
    })),
  ].slice(0, 10);

  setDocuments(limitedFiles);
  setFieldValue(
    "files",
    limitedFiles.map((doc) => doc.file)
  );

  const uploadedData = await Promise.all(
    filteredFiles.map(async (file) => {
      try {
        const base64 = await toBase64(file);
        const payload = {
          body: {
            fileName: file.name,
            path: `client_${decodedData?.clientId}/collection_${decodedData?.collectionId}/`,
            extension: "pdf",
            base64File: base64.split(",")[1],
            clientCollectionId: parseInt(decodedData?.collectionId),
          },
        };

        const response = await api.post("/file/upload", payload);
        handleApiResponse(response);

        const statusCode = response?.data?.statusCode;

        if (statusCode === 200 || statusCode === 201) {
          return {
            file,
            uploaded: true,
            filePath: response?.data?.data,
          };
        } else {
          console.error("Upload failed with status:", statusCode);
          setFileError(`Upload failed for ${file.name}`);
          return {
            file,
            uploaded: false,
            filePath: "",
          };
        }
      } catch (error) {
        console.error("Upload error:", error);
        setFileError(`Upload failed for ${file.name}`);
        return {
          file,
          uploaded: false,
          filePath: "",
        };
      }
    })
  );

  setDocuments((prev) => {
    const updated = [...prev];
    uploadedData.forEach((uploadedFile) => {
      const index = updated.findIndex((d) => d.file.name === uploadedFile.file.name);
      if (index !== -1) updated[index] = uploadedFile;
    });
    return updated;
  });
};

	
  const isAnyInputDisabled = documents.some((doc) => !doc.uploaded);
  return (
    <>
      <TitleCard title="Upload Collections">
        <div className="col-span-12 pb-6">
          <h6 className="text-lg">Upload Collections</h6>
        </div>
        <Formik
          initialValues={{ files: [] }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, isSubmitting, setFieldError }) => (
            <Form>
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file"
                  className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-[1px] border-dashed border-primary bg-lightprimary ${
                    (errors.files && touched.files) || fileError ? "border-red-500" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <Icon
                      icon="solar:cloud-upload-outline"
                      height={32}
                      className="mb-3 text-darklink"
                    />
                    <p className="mb-2 text-sm text-darklink">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-darklink">
                      PDF only (MAX. 10MB)
                    </p>
                    {/* {values.file && (
                    <p className="mt-2 text-sm text-darklink truncate max-w-[200px]">
                      Selected: {values.file.name}
                    </p> */}
                    {/* )} */}
                  </div>
                  <FileInput
                    id="dropzone-file"
                    name="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setFieldValue, setFieldError)}
                  />
                </Label>
              </div>

              {(errors.files && touched.files) || fileError ? (
                <div className="text-sm text-red-500 mt-1">
                  {fileError || (typeof errors.files === 'string' ? errors.files : 'Invalid file')}
                </div>
              ) : null}

              {documents.length > 0 && (
                <div className="mt-4">
                  <h6 className="font-semibold mb-2">Uploaded Files:</h6>
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-3 border p-3 rounded "
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {doc.file.name}
                        </p>
                      
                      </div>
                      <Icon
                        icon={"solar:trash-bin-minimalistic-outline"}
                        className="hover:bg-lightprimary dark:bg-light hover:text-primary cursor-pointer"
                        height={24}
                        onClick={() => {
                          const updated = [...documents];
                          updated.splice(index, 1);
                          setDocuments(updated);
                          setFieldValue(
                            "files",
                            updated.map((d) => d.file)
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {uploadedPaths.map((file: any, index) => (
                <div key={index} className="flex gap-6 pl-6">
                  <p>{file.name}</p>
                  <TextInput
                    type="text"
                    placeholder="Enter description"
                    className="form-control"
                    value={file.description}
                    onChange={(e) => {
                      const updated: any = [...uploadedPaths];
                      updated[index].description = e.target.value;
                      setUploadedPaths(updated);
                    }}
                  />
                </div>
              ))}

              <div className="grid grid-cols-12 items-center mt-4">
                <div className="col-span-9 flex items-center gap-[1rem]">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting || loading || isAnyInputDisabled}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          size="sm"
                          aria-label="Info spinner example"
                          light
                        ></Spinner>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button
                    type="reset"
                    color="error"
                    disabled={isSubmitting || loading}
                    onClick={() => {
                      setDocuments([]);
                      setFieldValue("files", []);
                      router.back();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </TitleCard>
    </>
  );
};

export default DocumentForm;
